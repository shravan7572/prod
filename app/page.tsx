import Link from "next/link"


export default function Home() {
  return (
    <div>
      hii this is prod
      <br/ >
      signup and login will add soon.
      <br />
       <br />
        <br />
        

     
        <Link className="border-2 p-2 m-2"
        href="/post/createpost">create your first post</Link>
      
    </div>
  );
}
