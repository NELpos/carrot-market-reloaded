import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { NextRequest } from "next/server";

const loginProccess = async (id: number) => {
  const session = await getSession();
  session.id = id;
  await session.save();
  return redirect("/profile");
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return notFound();
  }

  const accessTokenParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  });
  const accessTokenURL = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
  const { error, access_token } = await (
    await fetch(accessTokenURL, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if (error) {
    return new Response(null, { status: 400 });
  }
  const userProfileResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: "no-cache",
  });
  const { id, avatar_url, login } = await userProfileResponse.json();

  const user = await db.user.findUnique({
    where: {
      github_id: id + "",
    },
    select: {
      id: true,
    },
  });
  if (user) {
    //찾는 user가 있는 경우
    return await loginProccess(user.id);
  }

  // Email 정보 읽어오기
  const emailProfileResponse = await fetch(
    "https://api.github.com/user/emails",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      cache: "no-cache",
    }
  );

  const email_list = await emailProfileResponse.json();

  //신규 user 인 경우, 기존에 등록되어 있는 username이 있는지 확인
  const findUsername = await db.user.findUnique({
    where: {
      username: login,
    },
    select: {
      username: true,
    },
  });

  let username = login;
  if (findUsername) {
    username = `${username}_github`;
  }
  const newUser = await db.user.create({
    data: {
      username: username,
      github_id: id + "",
      email: email_list[0].email || null,
    },
    select: {
      id: true,
    },
  });
  return await loginProccess(newUser.id);
}
