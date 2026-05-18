import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import {
  GraduationCap,
  Music,
  Palette,
  Code,
  MessageCircle,
  CalendarCheck,
  Clock,
  CheckCircle,
  Users,
  Sparkles,
} from 'lucide-react';

const courseCards = [
  {
    name: '钢琴启蒙课',
    teacher: '王老师',
    age: '5-12岁',
    desc: '从零开始，感受黑白键上的音乐世界',
    tag: '热门',
    tagColor: 'bg-accent-yellow text-foreground',
    icon: Music,
    iconBg: 'bg-accent-yellow/20',
  },
  {
    name: '美术创意课',
    teacher: '李老师',
    age: '4-10岁',
    desc: '水彩、素描、手工综合创意课',
    tag: '新课',
    tagColor: 'bg-accent-pink text-foreground',
    icon: Palette,
    iconBg: 'bg-accent-pink/20',
  },
  {
    name: '编程思维课',
    teacher: '张老师',
    age: '7-14岁',
    desc: 'Scratch图形化编程，锻炼逻辑思维',
    tag: '热门',
    tagColor: 'bg-accent-green text-foreground',
    icon: Code,
    iconBg: 'bg-accent-green/20',
  },
  {
    name: '英语口语课',
    teacher: '陈老师',
    age: '6-12岁',
    desc: '沉浸式情景口语教学，自信开口',
    tag: '推荐',
    tagColor: 'bg-accent-yellow text-foreground',
    icon: MessageCircle,
    iconBg: 'bg-primary/20',
  },
];

const steps = [
  { num: '1', title: '选择课程', desc: '浏览并选择感兴趣的试听课程', color: 'bg-primary', icon: GraduationCap },
  { num: '2', title: '选择时段', desc: '查看可用时间，选择合适的上课时间', color: 'bg-accent-yellow', icon: Clock },
  { num: '3', title: '预约成功', desc: '确认预约信息，获取确认凭证', color: 'bg-accent-green', icon: CheckCircle },
];

const advantages = [
  { icon: Users, title: '专业师资', desc: '所有讲师均持有专业资质认证', color: 'text-primary' },
  { icon: CalendarCheck, title: '灵活时段', desc: '多种时段可选，适配您的日程', color: 'text-accent-green' },
  { icon: Sparkles, title: '免费试听', desc: '首节试听课完全免费，零风险体验', color: 'text-accent-yellow' },
  { icon: GraduationCap, title: '小班教学', desc: '每班不超过6人，确保教学质量', color: 'text-accent-pink' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-4xl font-bold text-foreground">
            发现你的兴趣，<span className="text-primary">预约试听课程</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            专业的课程体系，灵活的时间安排，免费试听体验。让孩子在快乐中成长，在探索中学习。
          </p>
          <Link
            href="/booking"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-card transition-all hover:-translate-y-0.5 hover:shadow-float"
          >
            <CalendarCheck className="h-5 w-5" />
            立即预约试听
          </Link>
        </div>
      </section>

      {/* Hot Courses */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">热门试听课程</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {courseCards.map((c) => (
              <div
                key={c.name}
                className="group rounded-xl bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-float"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.iconBg}`}>
                    <c.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.tagColor}`}>
                    {c.tag}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-foreground">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{c.teacher}</span>
                  <span>|</span>
                  <span>{c.age}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">预约流程</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="rounded-xl bg-card p-6 text-center shadow-card">
                <div
                  className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${s.color} text-lg font-bold text-white`}
                >
                  {s.num}
                </div>
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">为什么选择我们</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((a) => (
              <div key={a.title} className="rounded-xl bg-card p-6 text-center shadow-card">
                <a.icon className={`mx-auto mb-3 h-8 w-8 ${a.color}`} />
                <h3 className="text-base font-semibold text-foreground">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="rounded-2xl bg-primary px-8 py-12">
            <h2 className="text-2xl font-bold text-primary-foreground">准备好开始了吗？</h2>
            <p className="mt-2 text-primary-foreground/80">免费试听课等你来预约，零风险体验优质课程</p>
            <Link
              href="/booking"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-semibold text-primary shadow-card transition-all hover:-translate-y-0.5 hover:shadow-float"
            >
              <CalendarCheck className="h-5 w-5" />
              立即预约
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-6">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          课程预约平台 · 让学习更简单
        </div>
      </footer>
    </div>
  );
}
