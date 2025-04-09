import { Users } from "lucide-react";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const CreateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },

  handler: async (ctx, args) => {
    // if user already exist

    const userData = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    //if user not found

    if (userData?.length == 0) {
      const data = {
        name: args.name,
        email: args.email,
        credits: 5000,
      };
      const result = await ctx.db.insert("users", {
        ...data,
      });

      console.log(result);
      return data;
    }
    return userData[0];
  },
});

export const UpdateUserToken = mutation({
  args: {
    id: v.id("users"),
    credits: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      credits: args.credits,
    });
  },
});
