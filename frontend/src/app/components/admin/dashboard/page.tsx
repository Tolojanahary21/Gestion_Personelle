// import Sidebar from "../components/admin/sidebar/sideBar";
import Hello from "./graph/Hello";
import StatsCards from "./graph/StatsCards";
import Personnel from "./graph/Personnel";
import Effectifs from "./graph/effectifs";
import LastActivities from "./graph/lastActivities";
export default function DashboardPage() {
  return (
    <main className="ml-70">
    
       <div className="">
        <Hello />
        <StatsCards />
        <Personnel />
        <Effectifs />
        <LastActivities />
       </div>
    </main>
  );
}