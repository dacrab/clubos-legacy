-- Enable RLS on registers table
alter table registers enable row level security;

-- Policy for admin users to do everything
create policy "Admins can do everything with registers"
on registers
for all
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Policy for staff to read all registers
create policy "Staff can read all registers"
on registers
for select
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'staff'
  )
);

-- Policy for staff to insert new registers
create policy "Staff can create new registers"
on registers
for insert
to authenticated
with check (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'staff'
  )
);

-- Policy for staff to update their own registers
create policy "Staff can update registers they created"
on registers
for update
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'staff'
  )
)
with check (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'staff'
  )
);

-- Grant necessary permissions to authenticated users
grant select, insert, update on registers to authenticated; 