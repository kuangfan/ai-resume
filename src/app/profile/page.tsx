"use client";

import { useState, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileSchema,
  ProfileFormData,
  degreeEnum,
  industryEnum,
} from "@/schema/profile";
import Navbar from "@/components/home/Navbar";
import { getSession } from "next-auth/react";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
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
      workExperiences: [
        {
          company: "",
          position: "",
          industry: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "educations",
  });

  const {
    fields: workExperienceFields,
    append: appendWorkExperience,
    remove: removeWorkExperience,
  } = useFieldArray({
    control,
    name: "workExperiences",
  });

  // 在组件加载时查询用户信息
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // 检查用户是否已登录
        const session = await getSession();
        if (!session) return;

        // 调用API获取用户信息
        const response = await fetch("/api/profile");

        if (response.ok) {
          const profileData = await response.json();
          console.log("获取到的用户信息:", profileData);

          // 如果有用户信息，回显到表单
          if (Object.keys(profileData).length > 0) {
            profileData.educations = profileData.Education || [];
            profileData.workExperiences = profileData.WorkExperience || [];
            // 使用react-hook-form的reset方法设置表单数据
            reset(profileData);
          }
        } else {
          const errorData = await response.json();
          console.error("获取用户信息失败:", errorData.error || "未知错误");
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
      }
    };

    fetchUserProfile();
  }, [reset]);

  // 提交表单数据到API
  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      // 调用API保存用户信息
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("保存成功:", result);
        // 这里可以添加成功提示
      } else {
        const errorData = await response.json();
        console.error("保存失败:", errorData.error || "未知错误");
        // 这里可以添加错误提示
      }
    } catch (error) {
      console.error("保存用户信息时发生错误:", error);
      // 这里可以添加网络错误提示
    } finally {
      setIsLoading(false);
    }
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
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-3">
                <i className="fas fa-briefcase text-sm"></i>
              </span>
              工作经历
              <button
                type="button"
                className="ml-auto text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
                onClick={() =>
                  appendWorkExperience({
                    company: "",
                    position: "",
                    industry: "",
                    startDate: "",
                    endDate: "",
                    description: "",
                  })
                }
              >
                <i className="fas fa-plus mr-1"></i> 添加经历
              </button>
            </h3>
            <div className="space-y-6">
              {workExperienceFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 relative"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      公司名称
                    </label>
                    <input
                      {...register(`workExperiences.${index}.company`)}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="请输入公司名称"
                    />
                    {errors.workExperiences?.[index]?.company && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.workExperiences?.[index]?.company?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      职位名称
                    </label>
                    <input
                      {...register(`workExperiences.${index}.position`)}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="请输入职位名称"
                    />
                    {errors.workExperiences?.[index]?.position && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.workExperiences?.[index]?.position?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      所属行业
                    </label>
                    <select
                      {...register(`workExperiences.${index}.industry`)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    >
                      <option value="">请选择</option>
                      {industryEnum.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    {errors.workExperiences?.[index]?.industry && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.workExperiences?.[index]?.industry?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      时间段
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        {...register(`workExperiences.${index}.startDate`)}
                        type="month"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                      <span className="text-gray-500">至</span>
                      <input
                        {...register(`workExperiences.${index}.endDate`)}
                        type="month"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                    {(errors.workExperiences?.[index]?.startDate ||
                      errors.workExperiences?.[index]?.endDate) && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.workExperiences?.[index]?.startDate?.message ||
                          errors.workExperiences?.[index]?.endDate?.message}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      工作内容
                    </label>
                    <textarea
                      {...register(`workExperiences.${index}.description`)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="请详细描述您的工作内容、职责和成就（至少10个字符）"
                    />
                    {errors.workExperiences?.[index]?.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.workExperiences?.[index]?.description?.message}
                      </p>
                    )}
                  </div>
                  {workExperienceFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWorkExperience(index)}
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
