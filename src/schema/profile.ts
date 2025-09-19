import { z } from "zod";

export const degreeEnum = [
  "初中及以下",
  "中专",
  "高中",
  "大专",
  "本科",
  "硕士",
  "博士",
];
export const industryEnum = [
  "互联网",
  "金融",
  "教育",
  "医疗",
  "制造业",
  "零售",
  "房地产",
  "物流",
  "媒体",
  "广告",
  "政府/非营利组织",
  "其他",
];
export const educationSchema = z.object({
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
export const workExperienceSchema = z.object({
  company: z
    .string()
    .min(2, "公司名称至少需要2个字符")
    .max(20, "公司名称不能超过20个字符"),
  position: z
    .string()
    .min(2, "职位名称至少需要2个字符")
    .max(10, "职位名称不能超过10个字符"),
  industry: z.enum(industryEnum, {
    message: "请选择所属行业",
  }),
  startDate: z.string().min(1, "请选择开始时间"),
  endDate: z.string().min(1, "请选择结束时间"),
  description: z
    .string()
    .min(10, "工作内容至少需要10个字符")
    .max(500, "工作内容不能超过500个字符"),
});

export const profileSchema = z.object({
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
  workExperiences: z.array(workExperienceSchema).min(1, "请添加至少1条工作经历"),
});
export type ProfileFormData = z.infer<typeof profileSchema>;