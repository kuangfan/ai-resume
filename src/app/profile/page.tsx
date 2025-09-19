"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/home/Navbar";

const degreeEnum = [
  "初中及以下",
  "中专",
  "高中",
  "大专",
  "本科",
  "硕士",
  "博士",
];
const educationSchema = z.object({
  school: z
    .string()
    .min(2, "学校至少需要2个字符")
    .max(10, "学校不能超过10个字符"),
  major: z
    .string()
    .min(2, "专业至少需要2个字符")
    .max(10, "专业不能超过10个字符"),
  degree: z.enum(degreeEnum, {
    message: "请选择学历",
  }),
  startDate: z.string().min(1, "请选择开始时间"),
  endDate: z.string().min(1, "请选择结束时间"),
});
const profileSchema = z.object({
  realName: z
    .string()
    .min(2, "姓名至少需要2个字符")
    .max(4, "姓名不能超过4个字符")
    .regex(/^[\u4e00-\u9fa5]+$/, "姓名只能包含中文汉字"),
  gender: z.enum(["男", "女"], {
    message: "请选择性别",
  }),
  phone: z.string().min(11, "请输入正确的手机号"),
  email: z.string().email("请输入正确的邮箱"),
  workYears: z
    .number("请输入数字")
    .int("必须为整数")
    .min(0, "工作年限不能小于0")
    .max(100, "工作年限不能大于100"),
  job: z.string().min(2, "岗位至少需要2个字符").max(10, "岗位不能超过10个字符"),
  educations: z.array(educationSchema).min(1, "请添加至少1条教育经历"),
});
type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      realName: "",
      gender: "男",
      phone: "",
      email: "",
      workYears: 0,
      job: "",
      educations: [
        {
          school: "",
          major: "",
          degree: "",
          startDate: "",
          endDate: "",
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "educations",
  });

  const onSubmit = async (data: ProfileFormData) => {
    console.log("onSubmit", data);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-10">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
            <h2 className="text-2xl font-semibold">个人中心</h2>
            <p className="text-sm mt-2">完善以下信息，AI将为您生成专业简历</p>
          </div>
          <form className="p-6 space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-3">
                <i className="fas fa-user text-sm"></i>
              </span>
              个人信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="realName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  姓名
                </label>
                <input
                  {...register("realName")}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="请输入您的姓名"
                />
                {errors.realName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.realName.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  性别
                </label>
                <select
                  {...register("gender")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="">请选择</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.gender.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  电话
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="请输入手机号码"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  邮箱
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="请输入邮箱地址"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="workYears"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  工作年限
                </label>
                <input
                  {...register("workYears", {
                    valueAsNumber: true,
                    setValueAs: (value) => (value === "" ? 0 : Number(value)),
                  })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="请输入工作年限"
                />
                {errors.workYears && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.workYears.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="job"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  职位
                </label>
                <input
                  {...register("job")}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="请输入职位"
                />
                {errors.job && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.job.message}
                  </p>
                )}
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-3">
                <i className="fas fa-graduation-cap text-sm"></i>
              </span>
              教育经历
              <button
                type="button"
                className="ml-auto text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
                onClick={() =>
                  append({
                    school: "",
                    major: "",
                    degree: "",
                    startDate: "",
                    endDate: "",
                  })
                }
              >
                <i className="fas fa-plus mr-1"></i> 添加经历
              </button>
            </h3>
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 relative"
                >
                  <div>
                    <label
                      htmlFor="school"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      学校名称
                    </label>
                    <input
                      {...register(`educations.${index}.school`)}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="例如：武汉大学"
                    />
                    {errors.educations?.[index]?.school && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.educations?.[index]?.school?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="degree"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      学历
                    </label>
                    <select
                      {...register(`educations.${index}.degree`)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    >
                      <option value="">请选择</option>
                      {degreeEnum.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    {errors.educations?.[index]?.degree && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.educations?.[index]?.degree?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="major"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      专业
                    </label>
                    <input
                      {...register(`educations.${index}.major`)}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="例如：信息工程"
                    />
                    {errors.educations?.[index]?.major && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.educations?.[index]?.major?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      时间段
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        {...register(`educations.${index}.startDate`)}
                        type="month"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                      <span className="text-gray-500">至</span>
                      <input
                        {...register(`educations.${index}.endDate`)}
                        type="month"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                    {(errors.educations?.[index]?.startDate ||
                      errors.educations?.[index]?.endDate) && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.educations?.[index]?.startDate?.message ||
                          errors.educations?.[index]?.endDate?.message}
                      </p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute top-0 right-0 text-red-500 hover:text-red-700 flex items-center text-sm font-medium focus:outline-none"
                    >
                      <i className="fas fa-trash-alt mr-1"></i>
                      删除
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? "保存中..." : "保存"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default Profile;
