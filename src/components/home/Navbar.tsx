"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const Navbar = () => {
  const currentPath = usePathname();
  console.log("currentPath", currentPath);
  const links = [
    {
      name: "首页",
      href: "/",
    },
    {
      name: "简历制作",
      href: "/generate",
    },
    {
      name: "简历模版",
      href: "/template",
    },
  ];

  return (
    <div className="sticky top-0 z-10 bg-white/90 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="h-8 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </span>
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                AI生成简历
              </span>
            </Link>
            <nav className="hidden md:flex md:ml-8">
              <div className="flex space-x-4">
                {links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors",
                      { "text-indigo-600": currentPath === item.href }
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/login"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                免费注册
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
