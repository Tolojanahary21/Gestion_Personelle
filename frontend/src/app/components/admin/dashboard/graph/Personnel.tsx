import PersonnelByGrade from "./personnel/PersonnelByGrade";
import PersonnelStatus from "./personnel/PersonnelStatus";

export default function Personnel() {
  return (
    
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PersonnelByGrade />
        <PersonnelStatus />
      </div>
   
  );
}