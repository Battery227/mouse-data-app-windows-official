# Pre-merge backup: separate Events + Timeline

Verbatim snapshot of the subject drawer's **separate** Events and Timeline tabs
(and the standalone `ScheduleTimeline`), taken right before merging Events into a
single unified Timeline.

If you don't like the merged Timeline, this is the version to revert to.

- **Git tag:** `before-events-timeline-merge`
- **Restore the components:**
  `git checkout before-events-timeline-merge -- src/components/SubjectDrawerV2.jsx src/components/ScheduleTimeline.jsx src/components/EventDialogV2.jsx`
- Or just ask Claude to **"revert the timeline merge"**.

The `.jsx` files here are reference copies; the live code lives in `src/components/`.
