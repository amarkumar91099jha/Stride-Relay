import { Routes, Route, Navigate } from "react-router-dom";
import { ReferralPage } from "@/pages/ReferralPage";
import { RedirectPage } from "@/pages/RedirectPage";
import { DashboardLayout } from "@/pages/DashboardLayout";
import { CampaignListPage } from "@/pages/CampaignListPage";
import { CampaignDetailPage } from "@/pages/CampaignDetailPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/campaigns" replace />} />
      <Route path="/refer/:jobId" element={<ReferralPage />} />
      <Route path="/go/:trackingToken" element={<RedirectPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Navigate to="campaigns" replace />} />
        <Route path="campaigns" element={<CampaignListPage />} />
        <Route path="campaigns/:campaignId" element={<CampaignDetailPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
