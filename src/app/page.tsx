import Link from "next/link";
import Navbar from "@/components/home/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-float"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-float animation-delay-3000"></div>
        </div>
        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="block mb-2">AI驱动的</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                专业简历生成器
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-10 text-indigo-100 max-w-2xl mx-auto">
              五分钟打造完美简历，从海量模板中选择或让AI为您量身定制
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/generate" className="px-8 py-4 bg-white text-indigo-900 font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-opacity-10">
                AI生成我的简历
              </Link>
              <Link href="/template" className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:scale-105 hover:bg-opacity-10 transition-all">
                浏览所有模板
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: "1000px" }}></div>
    </>
  );
}
