import { AppError }
  from "../../utils/AppError.js";

import * as repository
  from "./profile.repository.js";

export async function getProfile(
  userId: string
) {
  const profile =
    await repository.findByUserId(
      userId
    );

  if (!profile) {
    throw new AppError(
      "PROFILE_NOT_FOUND",
      404,
      "Profile not found"
    );
  }

  return profile;
}

export async function updateProfile(
  userId: string,
  data: repository.ProfileData
) {
  const existing =
    await repository.findByUserId(
      userId
    );

  if (existing) {
    await repository.recordHistory(
      userId,
      existing
    );
  }

  const updated =
    await repository.upsertProfile(
      userId,
      data
    );

  return updated;
}