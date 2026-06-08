-- ============================================================
-- TRIGGER: Auto-create profile on user signup
-- Runs when a new row is inserted into auth.users.
-- Uses metadata passed during signup (username, display_name).
-- Falls back to the email prefix if metadata isn't provided.
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- ============================================================
-- TRIGGER: Update conversations.last_message_at on new message
-- Denormalized for inbox sort performance — avoids subquery on messages.
-- ============================================================

create or replace function update_conversation_last_message()
returns trigger as $$
begin
  update conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

create trigger after_message_insert
  after insert on messages
  for each row
  execute function update_conversation_last_message();

-- ============================================================
-- TRIGGER: Enforce swap must be 'completed' before rating
-- Runs BEFORE INSERT so the row is never written if invalid.
-- ============================================================

create or replace function enforce_completed_swap_for_rating()
returns trigger as $$
begin
  if (select status from swaps where id = new.swap_id) != 'completed' then
    raise exception 'Ratings can only be submitted after swap is completed';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger before_rating_insert
  before insert on ratings
  for each row
  execute function enforce_completed_swap_for_rating();

-- ============================================================
-- TRIGGER: Update profiles.avg_rating after new rating
-- Recomputes the average from all ratings for that user.
-- Denormalized on profiles for feed rendering performance.
-- ============================================================

create or replace function update_profile_rating()
returns trigger as $$
begin
  update profiles
  set avg_rating = (
    select round(avg(score)::numeric, 1)
    from ratings
    where target_user_id = new.target_user_id
  )
  where id = new.target_user_id;
  return new;
end;
$$ language plpgsql;

create trigger after_rating_insert
  after insert on ratings
  for each row
  execute function update_profile_rating();
