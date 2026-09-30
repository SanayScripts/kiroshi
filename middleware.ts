import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtected = createRouteMatcher(["/dashboard(.*)", "/select-org(.*)"]);
const isSelectOrg = createRouteMatcher(["/select-org(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtected(req)) return;
  const { userId, orgId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn({ returnBackUrl: req.url });
  if (!orgId && !isSelectOrg(req)) {
    return NextResponse.redirect(new URL("/select-org", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
