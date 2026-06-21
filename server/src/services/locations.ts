import { redis } from "@/lib/redis.js";

const updateLocationService = async (body: {
  organizationId: string;
  userId: string;
  latitude: number;
  longitude: number;
}) => {
  const { organizationId, userId, latitude, longitude } = body;
  if (!latitude || !longitude)
    return { error: { message: "latitude and longitude are required" } };

  try {
    const key = `location:${organizationId}:${userId}`;
    const values = JSON.stringify({
      userId,
      latitude,
      longitude,
      updatedAt: new Date().toISOString(),
    });

    await redis.set(key, values, "EX", 60 * 60);

    return {
      success: true,
      message: "Location updated",
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

const getLocationsService = async (organizationId: string) => {
  try {
    const pattern = `location:${organizationId}:*`;
    const keys = await redis.keys(pattern);

    if (keys.length === 0) return { success: true, data: [] };

    const values = await redis.mget(keys);
    const locations = values
      .filter((v) => v !== null)
      .map((v) => JSON.parse(v as string));

    return {
      success: true,
      data: locations,
      message: "Locations get successfully",
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

export { updateLocationService, getLocationsService };
