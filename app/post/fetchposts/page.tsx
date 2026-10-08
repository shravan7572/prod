import { redirect } from "next/navigation";

export default function FetchPostsRedirect() {
  redirect("/feed");
}
