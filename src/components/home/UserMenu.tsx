import Link from "next/link";
import { useState } from "react";

interface Props {
  username: string;
  logout: () => void;
}

const UserMenu = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseOver={() => setIsOpen(true)}
      onMouseOut={() => setIsOpen(false)}
    >
      <div className="flex space-x-2 items-center cursor-pointer">
        <span className="h-8 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">{props.username[0].toUpperCase()}</span>
        </span>
        <div className="text-base font-medium text-gray-700">
          {props.username}
        </div>
        <i className="fas fa-chevron-down text-gray-500 text-xs"></i>
      </div>
      {isOpen && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-md shadow-lg z-50">
          <Link
            href="/profile"
            className="block px-4 py-2 rounded-md text-center text-sm text-gray-700 whitespace-nowrap hover:bg-indigo-50"
          >
            <i className="fas fa-user mr-2 text-indigo-600"></i>个人中心
          </Link>
          <Link
            href="/resume"
            className="block px-4 py-2 rounded-md text-center text-sm text-gray-700 whitespace-nowrap hover:bg-indigo-50"
          >
            <i className="fas fa-file-alt mr-2 text-indigo-600"></i>我的简历
          </Link>
          <div className="border-t border-gray-200 my-1"></div>
          <div
            onClick={props.logout}
            className="px-4 py-2 cursor-pointer text-center text-sm text-red-500 whitespace-nowrap"
          >
            <i className="fas fa-sign-out-alt mr-2 text-red-500"></i>退出登录
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
