import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  Calendar,
  Clock,
  Layers,
  Users,
  MessageSquare,
  Link as LinkIcon,
  Plus,
  Trash,
  CheckCircle2,
  Circle,
  PlayCircle,
  X,
  Folder,
  BarChart3,
  GitBranch,
  Globe,
  FileText,
  Activity,
  Pencil,
  ExternalLink,
  CheckCircle,
  TrendingUp,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  projectsApi,
  phasesApi,
  commentsApi,
  linksApi,
  stacksApi,
  membersApi,
  usersApi,
} from '../../api/endpoints';
import type { Project, Phase, Stack, Comment } from '../../types/models';
import {
  calculateProgress,
  formatDate,
  getErrorMessage,
  formatRelativeTime,
  cn,
} from '../../utils';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../../components/ui/Tabs';
import { Avatar } from '../../components/ui/Avatar';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { useToast } from '../../components/ui/Toast';
import { Input, Textarea } from '../../components/ui/Input';
import {
  PageContainer,
  SectionLabel,
} from '../../components/layout/PageLayout';
import { EmptyState } from '../../components/common/EmptyState';

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPhasesAll, setShowPhasesAll] = useState(false);
  const [showLinksAll, setShowLinksAll] = useState(false);
  const [showStackAll, setShowStackAll] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadProject = useCallback(() => {
    if (!id) return;
    projectsApi
      .get(Number(id))
      .then(res => {
        const data =
          (res.data as unknown as { data?: Project })?.data ||
          (res.data as unknown as Project);
        setProject(data);
      })
      .catch(err => {
        error('Failed to load project', getErrorMessage(err));
        navigate('/projects');
      })
      .finally(() => setIsLoading(false));
  }, [id, error, navigate]); // projectsApi is stable, removed from deps

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // ---- All useMemo hooks called unconditionally ----
  const phases = useMemo(() => project?.phases || [], [project]);

  const allFlattenedPhases = useMemo(() => {
    const list: Phase[] = [];
    const flatten = (arr: Phase[]) => {
      arr.forEach(p => {
        list.push(p);
        if (p.children) flatten(p.children);
      });
    };
    flatten(phases);
    return list;
  }, [phases]);

  const links = useMemo(() => project?.links || [], [project]);
  const stacks = useMemo(() => project?.stacks || [], [project]);
  const users = useMemo(() => project?.users || [], [project]);
  const comments = useMemo(() => project?.comments || [], [project]);
  const unreadCommentsCount = useMemo(
    () => comments.filter((c: Comment) => c.is_unread).length,
    [comments],
  );

  const progress = useMemo(
    () => calculateProgress(allFlattenedPhases),
    [allFlattenedPhases],
  );

  const statusInfo = useMemo(() => {
    if (progress >= 100) {
      return {
        label: 'Completed',
        className: 'bg-emerald-50 text-emerald-600',
      };
    }
    if (progress > 0) {
      return {
        label: 'In Progress',
        className: 'bg-emerald-50 text-emerald-600',
      };
    }
    return { label: 'Not Started', className: 'bg-gray-100 text-gray-500' };
  }, [progress]);

  const recentActivities = useMemo(() => {
    return project?.activity || [];
  }, [project]);

  // ---- Early return after all hooks ----
  if (isLoading || !project) {
    return (
      <PageContainer>
        <div className="py-20 text-center text-gray-400 text-sm">
          Loading project…
        </div>
      </PageContainer>
    );
  }

  // ---- From here `project` is guaranteed non-null ----
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await projectsApi.delete(project.id);
      success('Project deleted');
      navigate('/projects');
    } catch (err) {
      error('Failed to delete project', getErrorMessage(err));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const completedPhasesCount = allFlattenedPhases.filter(
    p => p.status === 'completed',
  ).length;
  const activePhasesCount = allFlattenedPhases.filter(
    p => p.status === 'active',
  ).length;

  const stats: Array<{
    label: string;
    value: string;
    sub: string;
    icon: typeof BarChart3;
    subColor: string;
    trend?: boolean;
    extra?: React.ReactNode;
    tabValue: string;
  }> = [
    {
      label: 'Progress',
      value: `${Math.round(progress)}%`,
      sub: `${completedPhasesCount} of ${allFlattenedPhases.length} phases completed`,
      icon: BarChart3,
      subColor: 'text-gray-400',
      tabValue: 'phases',
      extra: (
        <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gray-900 transition-all duration-700"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      ),
    },
    {
      label: 'Team Members',
      value: String(users.length),
      sub: `${users.length} this month`,
      icon: Users,
      subColor: 'text-emerald-600',
      trend: true,
      tabValue: 'team',
    },
    {
      label: 'Phases',
      value: String(allFlattenedPhases.length),
      sub: activePhasesCount > 0 ? `${activePhasesCount} Active` : '0 Active',
      icon: Calendar,
      subColor: 'text-emerald-600',
      tabValue: 'phases',
    },
    {
      label: 'Links',
      value: String(links.length),
      sub:
        links.filter(l => l.title).length > 0
          ? `${links.length} Active`
          : '0 Active',
      icon: LinkIcon,
      subColor: 'text-emerald-600',
      tabValue: 'links',
    },
    {
      label: 'Comments',
      value: String(comments.length),
      sub:
        comments.length > 0 ? `${comments.length} this month` : '0 this month',
      icon: MessageSquare,
      subColor: 'text-emerald-600',
      trend: true,
      tabValue: 'comments',
    },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start gap-6 justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="mt-1 h-8 w-8 flex-shrink-0 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            aria-label="Back to projects"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {project.name}
              </h1>
              <span
                className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-full',
                  statusInfo.className,
                )}
              >
                {statusInfo.label}
              </span>
            </div>
            {project.description && (
              <p className="text-sm text-gray-500 mt-1.5 max-w-2xl">
                {project.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAdmin && (
            <>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Pencil className="h-3.5 w-3.5" />}
                onClick={() => navigate(`/projects/${project.id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash className="h-3.5 w-3.5" />}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </Button>
            </>
          )}
          <Button
            size="sm"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => setActiveTab('phases')}
          >
            New Item
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-gray-200 mb-8">
          <TabsList className="gap-6 bg-transparent border-none p-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="comments" className="relative">
              Comments
              {unreadCommentsCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"
                  title={`${unreadCommentsCount} unread comments`}
                />
              )}
            </TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="stack">Stack</TabsTrigger>
          </TabsList>
        </div>

        <div>
          <TabsContent value="overview" className="mt-0 outline-none">
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {stats.map(stat => {
                const Icon = stat.icon;
                return (
                  <button
                    key={stat.label}
                    type="button"
                    onClick={() => setActiveTab(stat.tabValue)}
                    className="text-left bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">
                        {stat.label}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <p
                      className={cn(
                        'text-xs flex items-center gap-1',
                        stat.subColor,
                      )}
                    >
                      {stat.trend && <TrendingUp className="h-3 w-3" />}
                      {stat.sub}
                    </p>
                    {stat.extra}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              {/* Left Column */}
              <div className="xl:col-span-2 space-y-8">
                {/* Project Overview with Chart */}
                <Card className="!p-6 border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-gray-900">
                      Project Overview
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block h-0.5 w-4 bg-gray-900 rounded-full" />
                        Progress (%)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-gray-300" />
                        Total Phases ({allFlattenedPhases.length})
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Chart */}
                    <div className="flex-1">
                      <div className="h-[220px] w-full relative">
                        <svg viewBox="0 0 420 200" className="w-full h-full">
                          {/* Grid lines */}
                          {[0, 1, 2, 3, 4].map(i => (
                            <line
                              key={i}
                              x1="40"
                              y1={20 + i * 35}
                              x2="380"
                              y2={20 + i * 35}
                              stroke="#f3f4f6"
                              strokeWidth="1"
                            />
                          ))}
                          {/* Y-axis labels (progress %) */}
                          {[100, 75, 50, 25, 0].map((val, i) => (
                            <text
                              key={val}
                              x="35"
                              y={25 + i * 35}
                              textAnchor="end"
                              className="text-[10px] fill-gray-400"
                            >
                              {val}%
                            </text>
                          ))}
                          {/* Secondary Y-axis labels (total phases) */}
                          {[5, 4, 3, 2, 1, 0].map((val, i) => (
                            <text
                              key={`r-${val}`}
                              x="398"
                              y={25 + i * 28}
                              textAnchor="start"
                              className="text-[10px] fill-gray-400"
                            >
                              {val}
                            </text>
                          ))}
                          {/* X-axis labels */}
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map(
                            (month, i) => (
                              <text
                                key={month}
                                x={60 + i * 80}
                                y="195"
                                textAnchor="middle"
                                className="text-[10px] fill-gray-400"
                              >
                                {month}
                              </text>
                            ),
                          )}
                          {/* Dotted line at 80% */}
                          <line
                            x1="40"
                            y1="60"
                            x2="380"
                            y2="60"
                            stroke="#e5e7eb"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          {/* Chart line */}
                          <polyline
                            points="60,150 140,130 220,110 300,70 360,50"
                            fill="none"
                            stroke="#111827"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {/* Data points */}
                          {[
                            { x: 60, y: 150 },
                            { x: 140, y: 130 },
                            { x: 220, y: 110 },
                            { x: 300, y: 70 },
                            { x: 360, y: 50 },
                          ].map((point, i) => (
                            <circle
                              key={i}
                              cx={point.x}
                              cy={point.y}
                              r="3"
                              fill="#111827"
                            />
                          ))}
                        </svg>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="w-full lg:w-64 space-y-0 divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                      {[
                        {
                          label: 'Start Date',
                          value: project.start_date
                            ? formatDate(project.start_date)
                            : 'Not set',
                          icon: Calendar,
                        },
                        {
                          label: 'Target Date',
                          value: project.end_date
                            ? formatDate(project.end_date)
                            : 'Not set',
                          icon: Calendar,
                        },
                        {
                          label: 'Total Phases',
                          value: String(allFlattenedPhases.length),
                          icon: Layers,
                        },
                        {
                          label: 'Completed Phases',
                          value: String(completedPhasesCount),
                          icon: CheckCircle,
                        },
                        {
                          label: 'Active Phases',
                          value:
                            allFlattenedPhases
                              .filter(p => p.status === 'active')
                              .map(p => p.name)
                              .join(', ') || 'None',
                          icon: Activity,
                        },
                      ].map(item => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.label}
                            className="flex justify-between items-center px-4 py-3 bg-white"
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {item.label}
                              </span>
                            </div>
                            <span
                              className="text-xs font-semibold text-gray-900 text-right max-w-[100px] truncate cursor-default"
                              title={
                                item.label === 'Active Phases'
                                  ? item.value
                                  : undefined
                              }
                            >
                              {item.value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <Card className="!p-6 border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">
                      Recent Activity
                    </h3>
                    <button
                      onClick={() => setActiveTab('comments')}
                      className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1"
                    >
                      View all
                    </button>
                  </div>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {recentActivities.length > 0 ? (
                      recentActivities.map(activity => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3"
                        >
                          <Avatar
                            name={activity.actor?.name || 'System'}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium text-gray-900">
                                {activity.actor?.name || 'System'}
                              </span>{' '}
                              {activity.text || activity.action}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatRelativeTime(activity.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">
                        No recent activity
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {/* Phases / Quick Links / Stack widgets */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Phases */}
              <div className="xl:col-span-1">
                <Card className="!p-0 border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Phases
                    </h3>
                    <button
                      onClick={() => setShowPhasesAll(!showPhasesAll)}
                      className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1"
                    >
                      {showPhasesAll ? 'Show less' : 'View all'}
                    </button>
                  </div>
                  <div className="p-5 space-y-4">
                    {(showPhasesAll ? phases : phases.slice(0, 3)).map(
                      phase => (
                        <div key={phase.id} className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0">
                            {phase.status === 'completed' && (
                              <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              </div>
                            )}
                            {phase.status === 'active' && (
                              <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <PlayCircle className="h-3 w-3 text-white" />
                              </div>
                            )}
                            {phase.status === 'pending' && (
                              <div className="h-5 w-5 rounded-full border-2 border-gray-200 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-gray-400">
                                  {phase.order + 1}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {phase.name}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {phase.status === 'completed'
                                ? `Completed on ${formatDate(phase.updated_at || phase.created_at || '')}`
                                : phase.status === 'active'
                                  ? `Started on ${formatDate(phase.updated_at || phase.created_at || '')}`
                                  : 'Not started yet'}
                            </p>
                          </div>
                          {phase.status === 'completed' && (
                            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Completed
                            </span>
                          )}
                          {phase.status === 'active' && (
                            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                          {phase.status === 'pending' && (
                            <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                              Pending
                            </span>
                          )}
                        </div>
                      ),
                    )}
                    {phases.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">
                        No phases yet
                      </p>
                    )}
                    {phases.length > 3 && !showPhasesAll && (
                      <button
                        onClick={() => setShowPhasesAll(true)}
                        className="w-full text-xs text-gray-500 hover:text-gray-700 mt-2"
                      >
                        Show {phases.length - 3} more...
                      </button>
                    )}
                  </div>
                </Card>
              </div>

              {/* Quick Links */}
              <div className="xl:col-span-1">
                <Card className="!p-0 border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Quick Links
                    </h3>
                    <button
                      onClick={() => setShowLinksAll(!showLinksAll)}
                      className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1"
                    >
                      {showLinksAll ? 'Show less' : 'View all'}
                    </button>
                  </div>
                  <div className="p-5 space-y-3">
                    {(showLinksAll ? links : links.slice(0, 3)).map(link => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="h-9 w-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                          {link.title.toLowerCase().includes('github') && (
                            <GitBranch className="h-4 w-4" />
                          )}
                          {link.title.toLowerCase().includes('figma') && (
                            <Pencil className="h-4 w-4" />
                          )}
                          {link.title.toLowerCase().includes('doc') && (
                            <FileText className="h-4 w-4" />
                          )}
                          {(link.title.toLowerCase().includes('live') ||
                            link.title.toLowerCase().includes('website')) && (
                            <Globe className="h-4 w-4" />
                          )}
                          {!['github', 'figma', 'doc', 'live', 'website'].some(
                            k => link.title.toLowerCase().includes(k),
                          ) && <LinkIcon className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {link.title}
                          </h4>
                          <p className="text-xs text-gray-400 truncate">
                            {link.url.replace(/^https?:\/\//, '').split('/')[0]}
                          </p>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                    {links.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">
                        No links yet
                      </p>
                    )}
                    {links.length > 3 && !showLinksAll && (
                      <button
                        onClick={() => setShowLinksAll(true)}
                        className="w-full text-xs text-gray-500 hover:text-gray-700 mt-2"
                      >
                        Show {links.length - 3} more...
                      </button>
                    )}
                  </div>
                </Card>
              </div>

              {/* Stack */}
              <div className="xl:col-span-1">
                <Card className="!p-0 border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Stack
                    </h3>
                    <button
                      onClick={() => setShowStackAll(!showStackAll)}
                      className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1"
                    >
                      {showStackAll ? 'Show less' : 'View all'}
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3">
                      {(showStackAll ? stacks : stacks.slice(0, 4)).map(
                        stack => (
                          <div
                            key={stack.id}
                            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 bg-gray-50/50"
                          >
                            <div className="h-8 w-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                              <Layers className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-medium text-gray-700 truncate">
                              {stack.name}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                    {stacks.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-6">
                        No technologies added
                      </p>
                    )}
                    {stacks.length > 4 && !showStackAll && (
                      <button
                        onClick={() => setShowStackAll(true)}
                        className="w-full text-xs text-gray-500 hover:text-gray-700 mt-3"
                      >
                        Show {stacks.length - 4} more...
                      </button>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="phases" className="mt-0 outline-none">
            <PhasesTab project={project} onUpdate={loadProject} />
          </TabsContent>

          <TabsContent value="team" className="mt-0 outline-none">
            <TeamTab project={project} onUpdate={loadProject} />
          </TabsContent>

          <TabsContent value="comments" className="mt-0 outline-none">
            <CommentsTab project={project} onUpdate={loadProject} />
          </TabsContent>

          <TabsContent value="links" className="mt-0 outline-none">
            <LinksTab project={project} onUpdate={loadProject} />
          </TabsContent>

          <TabsContent value="stack" className="mt-0 outline-none">
            <StackTab project={project} onUpdate={loadProject} />
          </TabsContent>
        </div>
      </Tabs>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </PageContainer>
  );
}

// ─── PhasesTab ────────────────────────────────────────────────────────────────
function PhasesTab({
  project,
  onUpdate,
}: {
  project: Project;
  onUpdate: () => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingSubphase, setIsAddingSubphase] = useState(false);
  const [newName, setNewName] = useState('');
  const [addingSubphaseTo, setAddingSubphaseTo] = useState<number | null>(null);
  const [subphaseName, setSubphaseName] = useState('');
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());
  const { success, error } = useToast();

  // Recursively collect all phases to avoid duplicate work if needed, though we can just use project.phases
  const phases = project.phases || [];

  const toggleExpand = (phaseId: number) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsAdding(true);
    try {
      await phasesApi.create(project.id, {
        name: newName,
        status: 'pending',
        parent_id: null,
      });
      setNewName('');
      success('Phase added');
      onUpdate();
    } catch (err) {
      error('Failed to add phase', getErrorMessage(err));
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddSubphase = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!subphaseName.trim()) return;
    setIsAddingSubphase(true);
    try {
      await phasesApi.create(project.id, {
        name: subphaseName,
        status: 'pending',
        parent_id: parentId,
      });
      setSubphaseName('');
      setAddingSubphaseTo(null);
      success('Nested phase added');
      onUpdate();
    } catch (err) {
      error('Failed to add nested phase', getErrorMessage(err));
    } finally {
      setIsAddingSubphase(false);
    }
  };

  const handleStatusChange = async (
    phase: Phase,
    status: 'completed' | 'active' | 'pending',
  ) => {
    try {
      await phasesApi.update(project.id, phase.id, { status });
      onUpdate();
    } catch (err) {
      error('Failed to update phase', getErrorMessage(err));
    }
  };

  const handleDelete = async (phaseId: number) => {
    try {
      await phasesApi.delete(project.id, phaseId);
      success('Phase removed');
      onUpdate();
    } catch (err) {
      error('Failed to remove phase', getErrorMessage(err));
    }
  };

  const renderPhase = (phase: Phase, depth = 0) => (
    <div key={phase.id} className="space-y-3">
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors bg-white',
          depth > 0 && 'ml-8 border-l-4 border-l-gray-200',
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {(phase.children || []).length > 0 ? (
            <button
              onClick={() => toggleExpand(phase.id)}
              className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              {expandedPhases.has(phase.id) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6" /> // spacer to align phases without children
          )}
          {phase.status === 'completed' && (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
          )}
          {phase.status === 'active' && (
            <PlayCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
          )}
          {phase.status === 'pending' && (
            <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
          )}
          <div className="min-w-0 flex items-center gap-2">
            <h4
              className="font-medium text-gray-900 truncate text-sm cursor-pointer hover:underline"
              onClick={() => toggleExpand(phase.id)}
            >
              {phase.name}
            </h4>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg border border-gray-200">
            {(['pending', 'active', 'completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(phase, status)}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize',
                  phase.status === status
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/80'
                    : 'text-gray-500 hover:text-gray-900',
                )}
              >
                {status}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (addingSubphaseTo === phase.id) {
                setAddingSubphaseTo(null);
                setSubphaseName('');
              } else {
                setAddingSubphaseTo(phase.id);
                setSubphaseName('');
              }
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            title="Add nested phase"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(phase.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete phase"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      </div>

      {addingSubphaseTo === phase.id && (
        <div className={cn('mt-2', depth >= 0 && 'ml-8')}>
          <form
            onSubmit={e => handleAddSubphase(e, phase.id)}
            className="flex items-center gap-2"
          >
            <Input
              placeholder={`Add phase under ${phase.name}…`}
              value={subphaseName}
              onChange={e => setSubphaseName(e.target.value)}
              autoFocus
            />
            <Button
              type="submit"
              isLoading={isAddingSubphase}
              disabled={!subphaseName.trim()}
              size="sm"
            >
              Add
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setAddingSubphaseTo(null)}
            >
              Cancel
            </Button>
          </form>
        </div>
      )}

      {expandedPhases.has(phase.id) &&
        (phase.children || []).map(child => renderPhase(child, depth + 1))}
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionLabel>Project Timeline</SectionLabel>
      <div className="space-y-3 mt-4">
        {phases.map(phase => renderPhase(phase))}
        {phases.length === 0 && (
          <EmptyState
            title="No phases yet"
            description="Add project phases to track progress."
          />
        )}
      </div>
      <div className="pt-6 border-t border-gray-100">
        <form
          onSubmit={handleAdd}
          className="flex flex-col sm:flex-row items-end gap-3 max-w-xl"
        >
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              New Top-Level Phase Name
            </label>
            <Input
              placeholder="e.g. Design, Backend…"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            isLoading={isAdding}
            disabled={!newName.trim()}
            className="w-full sm:w-auto"
          >
            Add Phase
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── TeamTab ──────────────────────────────────────────────────────────────────
function TeamTab({
  project,
  onUpdate,
}: {
  project: Project;
  onUpdate: () => void;
}) {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();
  const members = project.users || [];

  const canManageMembers =
    currentUser?.role === 'admin' ||
    (currentUser?.permissions || []).includes('manage_project_members');

  const [showAddModal, setShowAddModal] = useState(false);
  const [allUsers, setAllUsers] = useState<
    { id: number; name: string; email: string }[]
  >([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [addingUserId, setAddingUserId] = useState<number | null>(null);
  const [removingUserId, setRemovingUserId] = useState<number | null>(null);
  const [userSearch, setUserSearch] = useState('');

  const openAddModal = async () => {
    setShowAddModal(true);
    setLoadingUsers(true);
    try {
      const res = await usersApi.list();
      const data = Array.isArray(res.data) ? res.data : [];
      setAllUsers(data as { id: number; name: string; email: string }[]);
    } catch {
      error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddMember = async (userId: number) => {
    setAddingUserId(userId);
    try {
      await membersApi.add(project.id, userId);
      success('Member added');
      setShowAddModal(false);
      onUpdate();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosErr.response?.status === 403) {
        error(
          'Permission denied',
          'You do not have permission to add members.',
        );
      } else if (axiosErr.response?.status === 409) {
        error('Already a member', 'This user is already on the project.');
      } else {
        error('Failed to add member');
      }
    } finally {
      setAddingUserId(null);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    setRemovingUserId(userId);
    try {
      await membersApi.remove(project.id, userId);
      success('Member removed');
      onUpdate();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosErr.response?.status === 403) {
        error(
          'Permission denied',
          axiosErr.response.data?.message || 'Cannot remove this member.',
        );
      } else {
        error('Failed to remove member');
      }
    } finally {
      setRemovingUserId(null);
    }
  };

  const memberIds = new Set(members.map(m => m.id));
  const addableUsers = allUsers.filter(
    u =>
      !memberIds.has(u.id) &&
      (u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())),
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <SectionLabel>Team Members</SectionLabel>
        {canManageMembers && (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={openAddModal}
          >
            Add Member
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {members.map(user => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={user.name} size="md" />
              <div className="min-w-0">
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {user.name}
                </h4>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            {canManageMembers && user.id !== currentUser?.id && (
              <button
                onClick={() => handleRemoveMember(user.id)}
                disabled={removingUserId === user.id}
                className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 flex-shrink-0 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                title="Remove member"
              >
                {removingUserId === user.id ? (
                  <span className="text-[10px]">…</span>
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        ))}
        {members.length === 0 && (
          <div className="col-span-full border border-dashed border-gray-200 rounded-xl">
            <EmptyState
              title="No members"
              description="Assign people to collaborate on this project."
            />
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">
                Add Project Member
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 pt-4 pb-2">
              <input
                autoFocus
                type="text"
                placeholder="Search by name or email…"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div className="overflow-y-auto max-h-72 px-2 pb-4 space-y-1">
              {loadingUsers ? (
                <div className="py-8 text-center text-sm text-gray-400 animate-pulse">
                  Loading employees…
                </div>
              ) : addableUsers.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  {userSearch
                    ? 'No matching employees found.'
                    : 'All employees are already members.'}
                </div>
              ) : (
                addableUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleAddMember(u.id)}
                    disabled={addingUserId === u.id}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-left disabled:opacity-60"
                  >
                    <Avatar name={u.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {u.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {u.email}
                      </p>
                    </div>
                    {addingUserId === u.id ? (
                      <span className="text-xs text-gray-400">Adding…</span>
                    ) : (
                      <span className="text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100">
                        Add
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CommentsTab ──────────────────────────────────────────────────────────────
function CommentsTab({
  project,
  onUpdate,
}: {
  project: Project;
  onUpdate: () => void;
}) {
  const { user: currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();
  const comments = project.comments || [];

  // Auto-mark as read on view
  useEffect(() => {
    const unreadIds = comments
      .filter((c: Comment) => c.is_unread)
      .map((c: Comment) => c.id);
    if (unreadIds.length > 0) {
      Promise.all(unreadIds.map((id: number) => commentsApi.markRead(id)))
        .then(() => onUpdate())
        .catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await commentsApi.create(project.id, { content });
      setContent('');
      success('Comment posted');
      onUpdate();
    } catch (err) {
      error('Failed to post comment', getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await commentsApi.delete(commentId);
      onUpdate();
    } catch (err) {
      error('Failed to delete comment', getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <SectionLabel>Discussions</SectionLabel>
      <div className="space-y-4 mt-2">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-4 group relative">
            {comment.is_unread && (
              <div
                className="absolute -left-2 top-2 h-2 w-2 rounded-full bg-blue-500"
                title="New unread comment"
              />
            )}
            <div className="flex-shrink-0 mt-0.5">
              <Avatar name={comment.user?.name || 'Unknown'} size="md" />
            </div>
            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">
                    {comment.user?.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatRelativeTime(comment.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {currentUser?.id === comment.user_id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <EmptyState
            title="No comments"
            description="Start the discussion with your team."
          />
        )}
      </div>
      <div className="pt-6 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-shrink-0 mt-0.5">
            <Avatar name={currentUser?.name || ''} size="md" />
          </div>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Leave a comment…"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={!content.trim()}
              >
                Post Comment
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── LinksTab ─────────────────────────────────────────────────────────────────
function LinksTab({
  project,
  onUpdate,
}: {
  project: Project;
  onUpdate: () => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const { success, error } = useToast();
  const links = project.links || [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    setIsAdding(true);
    try {
      await linksApi.create(project.id, { title, url });
      setTitle('');
      setUrl('');
      success('Link added');
      onUpdate();
    } catch (err) {
      error('Failed to add link', getErrorMessage(err));
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (linkId: number) => {
    try {
      await linksApi.delete(linkId);
      success('Link removed');
      onUpdate();
    } catch (err) {
      error('Failed to remove link', getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <SectionLabel>External Links</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {links.map(link => (
            <div
              key={link.id}
              className="group relative p-4 flex flex-col justify-center border border-gray-200 rounded-xl hover:border-gray-300 transition-colors bg-white"
            >
              <button
                onClick={() => handleDelete(link.id)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash className="h-4 w-4" />
              </button>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-left pr-8"
              >
                <div className="h-9 w-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:text-gray-700 transition-colors">
                  <LinkIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate group-hover:underline">
                    {link.title}
                  </h4>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {link.url}
                  </p>
                </div>
              </a>
            </div>
          ))}
        </div>
        {links.length === 0 && (
          <div className="mt-4 border border-dashed border-gray-200 rounded-xl">
            <EmptyState
              title="No external links"
              description="Add links to GitHub, Figma, Docs, etc."
            />
          </div>
        )}
      </div>
      <div className="pt-6 border-t border-gray-100 max-w-2xl">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Add New Link
        </h4>
        <form
          onSubmit={handleAdd}
          className="flex flex-col sm:flex-row items-end gap-3"
        >
          <div className="flex-1 w-full">
            <Input
              label="Title"
              placeholder="e.g. GitHub Repository"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full">
            <Input
              label="URL"
              placeholder="https://…"
              value={url}
              onChange={e => setUrl(e.target.value)}
              type="url"
            />
          </div>
          <Button
            type="submit"
            isLoading={isAdding}
            disabled={!title.trim() || !url.trim()}
            className="w-full sm:w-auto"
          >
            Add Link
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── StackTab ─────────────────────────────────────────────────────────────────
function StackTab({
  project,
  onUpdate,
}: {
  project: Project;
  onUpdate: () => void;
}) {
  const [availableStacks, setAvailableStacks] = useState<Stack[]>([]);
  const [newStackName, setNewStackName] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const { success, error } = useToast();
  const projectStacks = project.stacks || [];

  useEffect(() => {
    stacksApi
      .list()
      .then(res => {
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data as unknown as { data?: Stack[] }).data || [];
        setAvailableStacks(data);
      })
      .catch(console.error);
  }, []);

  const handleAddExisting = async (stackId: number) => {
    try {
      await stacksApi.addToProject(project.id, stackId);
      success('Technology added');
      onUpdate();
    } catch (err) {
      error('Failed to add technology', getErrorMessage(err));
    }
  };

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStackName.trim()) return;
    setIsAddingNew(true);
    try {
      const res = await stacksApi.create({ name: newStackName });
      const createdStack =
        (res.data as unknown as { data?: Stack }).data ||
        (res.data as unknown as Stack);
      await stacksApi.addToProject(project.id, createdStack.id);
      setNewStackName('');
      success('Technology added');
      onUpdate();
      stacksApi.list().then(r => {
        const data = Array.isArray(r.data)
          ? r.data
          : (r.data as unknown as { data?: Stack[] }).data || [];
        setAvailableStacks(data);
      });
    } catch (err) {
      error('Failed to add technology', getErrorMessage(err));
    } finally {
      setIsAddingNew(false);
    }
  };

  const handleRemove = async (stackId: number) => {
    try {
      await stacksApi.removeFromProject(project.id, stackId);
      success('Technology removed');
      onUpdate();
    } catch (err) {
      error('Failed to remove technology', getErrorMessage(err));
    }
  };

  const unassignedStacks = availableStacks.filter(
    s => !projectStacks.some(ps => ps.id === s.id),
  );

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <SectionLabel>Project Stack</SectionLabel>
        <div className="flex flex-wrap gap-2 mt-4">
          {projectStacks.map(stack => (
            <div
              key={stack.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white shadow-sm text-sm font-medium text-gray-700"
            >
              <span>{stack.name}</span>
              <button
                onClick={() => handleRemove(stack.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {projectStacks.length === 0 && (
            <div className="w-full border border-dashed border-gray-200 rounded-xl">
              <EmptyState
                title="No technologies"
                description="Specify the stack being used for this project."
              />
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-gray-100">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            Add Existing
          </h4>
          <div className="flex flex-wrap gap-2">
            {unassignedStacks.map(stack => (
              <button
                key={stack.id}
                onClick={() => handleAddExisting(stack.id)}
                className="px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-white transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-3 w-3" />
                {stack.name}
              </button>
            ))}
            {unassignedStacks.length === 0 && (
              <p className="text-sm text-gray-400">
                All technologies have been added.
              </p>
            )}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            Create New
          </h4>
          <form onSubmit={handleAddNew} className="flex gap-2 max-w-sm">
            <Input
              placeholder="e.g. Next.js"
              value={newStackName}
              onChange={e => setNewStackName(e.target.value)}
            />
            <Button
              type="submit"
              isLoading={isAddingNew}
              disabled={!newStackName.trim()}
              variant="secondary"
            >
              Add
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
