import { NextApiRequest, NextApiResponse } from "next";
import getScreenshot from "../screenshot";

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  const file = await getScreenshot("https://apple.com");
  res.statusCode = 200;
  // res.setHeader('Content-Type', 'image/png');
  res.setHeader("Content-Type", "application/pdf");
  res.end(file);
};
