import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { LandingPage } from "@/features/landing/LandingPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { AssessmentHubPage } from "@/features/assessment/AssessmentHubPage";
import { AssessmentSessionPage } from "@/features/assessment/AssessmentSessionPage";
import { AssessmentResultsPage } from "@/features/assessment/AssessmentResultsPage";
import { SkillGapPage } from "@/features/skillgap/SkillGapPage";
import { RoadmapPage } from "@/features/roadmap/RoadmapPage";
import { ChatPage } from "@/features/chat/ChatPage";
import { ResourcesPage } from "@/features/resources/ResourcesPage";
import { ReportsPage } from "@/features/report/ReportsPage";
import { NotificationsPage } from "@/features/notifications/NotificationsPage";
import { AdminDashboardPage } from "@/features/admin/AdminDashboardPage";

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  // Protected App routes
  {
    element: <AppLayout />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/assessments",
        element: <AssessmentHubPage />,
      },
      {
        path: "/assessments/:sessionId",
        element: <AssessmentSessionPage />,
      },
      {
        path: "/assessments/:sessionId/results",
        element: <AssessmentResultsPage />,
      },
      {
        path: "/skill-gap",
        element: <SkillGapPage />,
      },
      {
        path: "/roadmap",
        element: <RoadmapPage />,
      },
      {
        path: "/chat",
        element: <ChatPage />,
      },
      {
        path: "/resources",
        element: <ResourcesPage />,
      },
      {
        path: "/reports",
        element: <ReportsPage />,
      },
      {
        path: "/notifications",
        element: <NotificationsPage />,
      },
      {
        path: "/admin",
        element: <AdminDashboardPage />,
      },
    ],
  },

  // Catch-all
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);