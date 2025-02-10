-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type user_role as enum ('admin', 'staff', 'secretary');
create type appointment_type as enum ('football', 'party');

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text not null,
  role user_role not null default 'staff',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  price decimal(10,2) not null,
  stock integer not null default 0,
  image_url text,
  category text not null,
  subcategory text,
  last_edited_by uuid references profiles(id),
  is_deleted boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Grant access to service role and disable RLS for service role
grant all privileges on table products to service_role;
alter table products force row level security;
alter table products enable row level security;

-- Products policies
create policy "Products are viewable by authenticated users"
  on products for select
  using (auth.role() = 'authenticated');

create policy "Only admins can manage products"
  on products for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Create registers table
create table registers (
  id uuid default uuid_generate_v4() primary key,
  opened_at timestamp with time zone default timezone('utc'::text, now()) not null,
  closed_at timestamp with time zone,
  items_sold integer not null default 0,
  coupons_used integer not null default 0,
  treat_items_sold integer not null default 0,
  total_amount decimal(10,2) not null default 0,
  closed_by uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create sales table
create table sales (
  id uuid default uuid_generate_v4() primary key,
  register_id uuid references registers(id) not null,
  total_amount decimal(10,2) not null,
  coupon_applied boolean not null default false,
  created_by uuid references profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create sale_items table for the products in each sale
create table sale_items (
  id uuid default uuid_generate_v4() primary key,
  sale_id uuid references sales(id) not null,
  product_id uuid references products(id) not null,
  quantity integer not null,
  price_at_sale decimal(10,2) not null,
  is_treat boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create appointments table
create table appointments (
  id uuid default uuid_generate_v4() primary key,
  type appointment_type not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  customer_name text not null,
  customer_phone text not null,
  notes text,
  guests integer,
  created_by uuid references profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table profiles enable row level security;
alter table registers enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table appointments enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Registers policies
create policy "Registers are viewable by staff and admin"
  on registers for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin', 'staff')
    )
  );

create policy "Staff and admin can insert registers"
  on registers for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin', 'staff')
    )
  );

create policy "Staff and admin can update registers"
  on registers for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin', 'staff')
    )
  );

-- Sales policies
create policy "Sales are viewable by staff and admin"
  on sales for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin', 'staff')
    )
  );

create policy "Staff and admin can insert sales"
  on sales for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin', 'staff')
    )
  );

-- Sale items policies
create policy "Sale items are viewable by staff and admin"
  on sale_items for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin', 'staff')
    )
  );

create policy "Staff and admin can insert sale items"
  on sale_items for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin', 'staff')
    )
  );

-- Appointments policies
create policy "Appointments are viewable by secretary and admin"
  on appointments for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin', 'secretary')
    )
  );

create policy "Secretary and admin can manage appointments"
  on appointments for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin', 'secretary')
    )
  );

-- Functions
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'staff');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 