import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    credits: v.number(),
    subscriptionId: v.optional(v.string()),
  }),

  DiscussionRoom: defineTable({
    subjectOption: v.string(),
    topic: v.string(),
    expertName: v.string(),
    conversation: v.optional(v.any()),
    feedback: v.optional(v.string()),
    uid: v.optional(v.id("users")),
  }),
});
