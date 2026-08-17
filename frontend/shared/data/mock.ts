// Static mock data for the visual-design pass. Nothing here is wired to a
// real API — shapes are kept plausible so real data-fetching can slot in
// later without reshaping the UI.

export type Band = {
  id: string;
  name: string;
  location: string;
};

export const bands: Band[] = [
  { id: "marlow-bend", name: "Marlow Bend", location: "Richmond, VA" },
  { id: "sun-and-static", name: "Sun & Static", location: "Side project" },
];

export const currentUser = {
  name: "Jordan Calder",
  role: "Songwriter, vocals",
};

export type TaskStatus = "overdue" | "soon" | "upcoming" | "done";

export type Task = {
  id: string;
  title: string;
  module: string;
  dueLabel: string;
  status: TaskStatus;
};

export const thisWeekTasks: Task[] = [
  {
    id: "t1",
    title: "Follow up with Larkspur Hall about the Oct 3 date",
    module: "Relationships",
    dueLabel: "Overdue since Sun",
    status: "overdue",
  },
  {
    id: "t2",
    title: 'Draft the release announcement post for "Low Tide"',
    module: "Content",
    dueLabel: "Due tomorrow",
    status: "soon",
  },
  {
    id: "t3",
    title: 'Send the playlist pitch for "Low Tide"',
    module: "Releases",
    dueLabel: "Due Wed",
    status: "upcoming",
  },
  {
    id: "t4",
    title: 'Confirm the split sheet for "Low Tide" with M. Reyes',
    module: "Rights & Admin",
    dueLabel: "Due Thu",
    status: "upcoming",
  },
  {
    id: "t5",
    title: "Submit the Amplify Music Fund application",
    module: "Grants",
    dueLabel: "Due Fri",
    status: "upcoming",
  },
];

export type LaterTask = {
  id: string;
  title: string;
  module: string;
};

export const laterTasks: LaterTask[] = [
  {
    id: "l1",
    title: "Update the artist bio on streaming profiles",
    module: "Artist DNA",
  },
  {
    id: "l2",
    title: "Log expenses from the June tour",
    module: "Finance",
  },
  {
    id: "l3",
    title: "Reply to the remix request from a fan",
    module: "Relationships",
  },
  {
    id: "l4",
    title: "Renew the rehearsal space booking for next quarter",
    module: "Rights & Admin",
  },
];

export const bandContext = {
  nextRelease: { title: "Low Tide", type: "Single", date: "Oct 3, 2026" },
  nextShow: { venue: "The Aerie", city: "Ashbury, VA", date: "Sept 12, 2026" },
};
