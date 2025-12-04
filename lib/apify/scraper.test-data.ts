/**
 * Test data matching the actual Apify output format
 * This file is for reference and testing purposes
 */

export const sampleApifyOutput = [
  {
    "videoMeta.coverUrl": "https://p16-pu-sign-useast8.tiktokcdn-us.com/tos-useast8-p-0068-tx2/oMVDflDvEIwBITFAp8iAngIf8B1RBHEBEEEngj~tplv-tiktokx-origin.image?dr=14575&x-expires=1764046800&x-signature=AOKZPxiBMy4N8kcc8Cmn2gVw2LI%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=maliva",
    "text": "The end of failure #funnytiktok #funnyvideo #usa🇺🇸 #funny ",
    "diggCount": 449,
    "shareCount": 59,
    "playCount": 18300,
    "commentCount": 15,
    "videoMeta.duration": 64,
    "isAd": false,
    "hashtags": [
      {
        "name": "funnytiktok"
      },
      {
        "name": "funnyvideo"
      },
      {
        "name": "usa🇺🇸"
      },
      {
        "name": "funny"
      }
    ],
    "authorMeta.name": "funnydogs888",
    "webVideoUrl": "https://www.tiktok.com/@funnydogs888/video/7567315090047782174",
    "createTimeISO": "2025-10-31T09:28:32.000Z"
  },
];

/**
 * Expected parsed output for the sample data
 */
export const expectedParsedOutput = {
  videos: [
    {
      video_id: "7567315090047782174",
      video_url: "https://www.tiktok.com/@funnydogs888/video/7567315090047782174",
      description: "The end of failure #funnytiktok #funnyvideo #usa🇺🇸 #funny ",
      thumbnail_url: "https://p16-pu-sign-useast8.tiktokcdn-us.com/tos-useast8-p-0068-tx2/oMVDflDvEIwBITFAp8iAngIf8B1RBHEBEEEngj~tplv-tiktokx-origin.image?dr=14575&x-expires=1764046800&x-signature=AOKZPxiBMy4N8kcc8Cmn2gVw2LI%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=maliva",
      views: 18300,
      likes: 449,
      comments: 15,
      shares: 59,
      posted_at: "2025-10-31T09:28:32.000Z",
      duration_seconds: 64,
    },
  ],
  profile: {
    display_name: "funnydogs888",
    avatar_url: null,
    follower_count: null,
  },
};

