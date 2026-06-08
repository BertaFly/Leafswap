-- ============================================================
-- ROW LEVEL SECURITY
-- RLS is already enabled on all tables (auto-enabled by project setting).
-- Every table needs explicit policies — without them, no rows are returned.
-- ============================================================

-- ============================================================
-- PROFILES
-- ============================================================

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (id = auth.uid());

create policy "Users can update their own profile"
  on profiles for update using (id = auth.uid());

-- ============================================================
-- PLANTS
-- Public plants visible to all; private plants visible to owner only.
-- ============================================================

create policy "Public plants are viewable by everyone"
  on plants for select using (is_public = true or owner_id = auth.uid());

create policy "Users can insert their own plants"
  on plants for insert with check (owner_id = auth.uid());

create policy "Users can update their own plants"
  on plants for update using (owner_id = auth.uid());

create policy "Users can delete their own plants"
  on plants for delete using (owner_id = auth.uid());

-- ============================================================
-- POSTS
-- ============================================================

create policy "Posts are viewable by everyone"
  on posts for select using (true);

create policy "Authenticated users can create posts"
  on posts for insert with check (author_id = auth.uid());

create policy "Authors can update their posts"
  on posts for update using (author_id = auth.uid());

create policy "Authors can delete their posts"
  on posts for delete using (author_id = auth.uid());

-- ============================================================
-- POST PLANTS
-- ============================================================

create policy "Post plants are viewable by everyone"
  on post_plants for select using (true);

create policy "Post authors can add plants to their posts"
  on post_plants for insert with check (
    exists (select 1 from posts where id = post_id and author_id = auth.uid())
  );

create policy "Post authors can update plants on their posts"
  on post_plants for update using (
    exists (select 1 from posts where id = post_id and author_id = auth.uid())
  );

create policy "Post authors can remove plants from their posts"
  on post_plants for delete using (
    exists (select 1 from posts where id = post_id and author_id = auth.uid())
  );

-- ============================================================
-- CONVERSATIONS
-- ============================================================

create policy "Participants can view their conversations"
  on conversations for select using (
    participant_1 = auth.uid() or participant_2 = auth.uid()
  );

create policy "Authenticated users can start conversations"
  on conversations for insert with check (
    participant_1 = auth.uid() or participant_2 = auth.uid()
  );

create policy "Participants can update their conversations"
  on conversations for update using (
    participant_1 = auth.uid() or participant_2 = auth.uid()
  );

-- ============================================================
-- MESSAGES
-- ============================================================

create policy "Participants can view messages in their conversations"
  on messages for select using (
    exists (
      select 1 from conversations
      where id = conversation_id
      and (participant_1 = auth.uid() or participant_2 = auth.uid())
    )
  );

create policy "Participants can send messages"
  on messages for insert with check (
    sender_id = auth.uid() and
    exists (
      select 1 from conversations
      where id = conversation_id
      and (participant_1 = auth.uid() or participant_2 = auth.uid())
    )
  );

create policy "Participants can mark messages as read"
  on messages for update using (
    exists (
      select 1 from conversations
      where id = conversation_id
      and (participant_1 = auth.uid() or participant_2 = auth.uid())
    )
  );

-- ============================================================
-- SWAPS
-- ============================================================

create policy "Swap parties can view their swaps"
  on swaps for select using (
    initiator_id = auth.uid() or receiver_id = auth.uid()
  );

create policy "Authenticated users can propose swaps"
  on swaps for insert with check (initiator_id = auth.uid());

create policy "Swap parties can update swap status"
  on swaps for update using (
    initiator_id = auth.uid() or receiver_id = auth.uid()
  );

-- ============================================================
-- SWAP REQUESTED PLANTS
-- ============================================================

create policy "Swap parties can view swap requested plants"
  on swap_requested_plants for select using (
    exists (
      select 1 from swaps
      where id = swap_id
      and (initiator_id = auth.uid() or receiver_id = auth.uid())
    )
  );

create policy "Initiator can add plants to their swap proposal"
  on swap_requested_plants for insert with check (
    exists (
      select 1 from swaps
      where id = swap_id
      and initiator_id = auth.uid()
    )
  );

create policy "Initiator can remove plants from their swap proposal"
  on swap_requested_plants for delete using (
    exists (
      select 1 from swaps
      where id = swap_id
      and initiator_id = auth.uid()
    )
  );

-- ============================================================
-- CARE LOGS
-- Private — only the plant owner can access.
-- ============================================================

create policy "Plant owners can view their care logs"
  on care_logs for select using (
    exists (select 1 from plants where id = plant_id and owner_id = auth.uid())
  );

create policy "Plant owners can insert care logs"
  on care_logs for insert with check (
    exists (select 1 from plants where id = plant_id and owner_id = auth.uid())
  );

create policy "Plant owners can update care logs"
  on care_logs for update using (
    exists (select 1 from plants where id = plant_id and owner_id = auth.uid())
  );

create policy "Plant owners can delete care logs"
  on care_logs for delete using (
    exists (select 1 from plants where id = plant_id and owner_id = auth.uid())
  );

-- ============================================================
-- RATINGS
-- Anyone can read ratings (trust/reputation is public).
-- Only swap participants can write a rating for their swap.
-- ============================================================

create policy "Ratings are viewable by everyone"
  on ratings for select using (true);

create policy "Swap parties can submit ratings"
  on ratings for insert with check (
    source_user_id = auth.uid() and
    exists (
      select 1 from swaps
      where id = swap_id
      and (initiator_id = auth.uid() or receiver_id = auth.uid())
    )
  );
