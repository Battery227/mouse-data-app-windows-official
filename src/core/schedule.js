/**
 * Shared scheduling helpers.
 *
 * computeSubjectTimeline derives a subject's scheduled items from its group's timeline
 * and the subject's start date. Used by both the subject drawer Timeline tab and the
 * cross-experiment task board so the logic stays in one place.
 */

export const EVENT_COLORS = {
  injection: '#2196f3',
  test: '#4caf50',
  care: '#ff9800',
  death: '#f44336',
  note: '#9e9e9e'
};

/**
 * @returns {Array<{id,day,category,name,description,scheduledDate:Date,status,daysSinceStart,completed:boolean}>}
 */
export function computeSubjectTimeline(subject, experiment) {
  if (!subject?.cohortId || !subject?.groupId || !experiment?.config?.cohorts) return [];

  const cohort = experiment.config.cohorts.find(c => c.id === subject.cohortId);
  if (!cohort) return [];

  const group = cohort.groups?.find(g => g.id === subject.groupId);
  if (!group || !group.timeline) return [];

  const startDate = subject.startDate ? new Date(subject.startDate) : new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return group.timeline.map(event => {
    const scheduledDate = new Date(startDate);
    scheduledDate.setDate(scheduledDate.getDate() + event.day);
    scheduledDate.setHours(0, 0, 0, 0);

    const completed = Boolean(subject.timelineCompletions?.[event.id]);
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const status = completed ? 'completed' :
                   daysSinceStart >= event.day ? 'overdue' :
                   daysSinceStart === event.day - 1 ? 'due-soon' : 'upcoming';

    const note = subject.timelineNotes?.[event.id] || '';
    return { ...event, scheduledDate, status, daysSinceStart, completed, note };
  }).sort((a, b) => a.day - b.day);
}

// Made with Bob
