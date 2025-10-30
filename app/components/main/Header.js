"use client";

export default function Header({ login }) {
  return (
    <div className="box-border w-[100vw] h-18 p-3 text-nav text-white bg-black-100">
      <div className="flex items-center w-full h-full px-3 py-1 bg-black-200 border-b border-white text-white">
        <div className="flex-1 w-full">TheLifeMuseum</div>
        <div className="flex flex-1 w-full">
          <div className="flex gap-5 flex-1 justify-end">
            <p>About</p>
            <p onClick={login}>Login</p>
          </div>
        </div>
      </div>
    </div>
  );
}
