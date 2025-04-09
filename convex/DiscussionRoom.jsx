import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

export const CreateNewRoom = mutation({
  args: {
    subjectOption: v.string(),
    topic: v.string(),
    expertName: v.string(),
    uid: v.id("users"),
  },

  handler: async (ctx, args) => {
    const result = await ctx.db.insert("DiscussionRoom", {
      subjectOption: args.subjectOption,
      topic: args.topic,
      expertName: args.expertName,
      uid: args.uid,
    });

    return result;
  },
});

export const GetDiscussionRoom = query({
  args: {
    id: v.id("DiscussionRoom"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.id);
    return result;
  },
});

// First option: Update your updateConversation mutation to accept a feedback field
export const updateConversation = mutation({
  args: {
    id: v.id("DiscussionRoom"),
    conversation: v.optional(v.any()),
    feedback: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const updateObj = {};

    if (args.conversation !== undefined) {
      updateObj.conversation = args.conversation;
    }

    if (args.feedback !== undefined) {
      updateObj.feedback = args.feedback;
    }

    await ctx.db.patch(args.id, updateObj);
  },
});

export const GetAllDiscussionRoom = query({
  args: {
    uid: v.id("users"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("DiscussionRoom")
      .filter((q) => q.eq(q.field("uid"), args.uid))

      .order("desc")
      .collect();
    return result;
  },
});
