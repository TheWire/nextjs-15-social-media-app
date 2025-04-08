import { validateRequest } from "@/auth";
import { prisma } from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { createUploadthing, FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

const f = createUploadthing();

function getUrl(url: string) {
  const newApiRegex = new RegExp(
    `^https://${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}\\.ufs\\.sh/f/[a-zA-Z0-9-_]+$`,
  );
  const oldApiRegex = /^https:\/\/utfs\.io\/f\/[a-zA-Z0-9-_]+$/;
  if (newApiRegex.test(url)) {
    return url;
  } else if (oldApiRegex.test(url)) {
    return url.replace(
      "/f/",
      `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
    );
  } else {
    console.log("path not matched")
    return undefined;
  }
}

function getDeleteKey(url: string) {
  const newApiRegex = new RegExp(
    `^https://${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}\\.ufs\\.sh/f/[a-zA-Z0-9-_]+$`,
  );
  const oldApiRegex = /^https:\/\/utfs\.io\/f\/[a-zA-Z0-9-_]+$/;
  if (newApiRegex.test(url)) {
    return url.split(`/f/[a-zA-Z0-9-_]+$`)[1];
  }
  return url.split(`/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`)[1];
}

export const fileRouter = {
  avatar: f({
    image: { maxFileSize: "512KB" },
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");

      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldAvatarUrl = metadata.user.avatarUrl;

      if (oldAvatarUrl) {
        const key = getDeleteKey(oldAvatarUrl);
        await new UTApi().deleteFiles(key);
      }

      const newAvatarUrl = getUrl(file.url);
      if (!newAvatarUrl) throw new UploadThingError("Got invalid avatar url");
      await Promise.all([
        prisma.user.update({
          where: { id: metadata.user.id },
          data: {
            avatarUrl: newAvatarUrl,
          },
        }),
        streamServerClient.partialUpdateUser({
          id: metadata.user.id,
          set: {
            image: newAvatarUrl,
          },
        }),
      ]);

      return { avatarUrl: newAvatarUrl };
    }),
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      const newUrl = getUrl(file.url);
      if (!newUrl) throw new UploadThingError("Got invalid media url");
      const media = await prisma.media.create({
        data: {
          url: newUrl,
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });

      return { mediaId: media.id };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
