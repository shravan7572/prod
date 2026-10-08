import { redirect } from "next/navigation";

export default function CreatePostRedirect() {
  redirect("/feed");
}