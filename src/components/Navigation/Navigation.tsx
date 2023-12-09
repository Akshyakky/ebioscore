import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import moduleService from "../../services/moduleService";
import { ModuleDto, SubModuleDto } from "../../types/types";

interface NavigationProps {
  userID: number | null;
  token: string | null;
}

const Navigation: React.FC<NavigationProps> = ({ userID, token }) => {
  debugger;
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [subModules, setSubModules] = useState<SubModuleDto[]>([]);

  useEffect(() => {
    const fetchNavigationData = async () => {
      const modulesData = await moduleService.getActiveModules(
        userID ?? 0,
        token ?? ""
      );
      setModules(modulesData);
      const subModulesData = await moduleService.getActiveSubModules(
        userID ?? 0,
        token ?? ""
      );
      setSubModules(subModulesData);
    };

    fetchNavigationData();
  }, [userID, token]);

  return (
    <nav>
      <ul>
        {modules.map((module) => (
          <li key={module.AuGrpID}>
            <NavLink to={module.Link}>
              {module.ICon && <i className={`fa ${module.ICon}`}></i>}
              {module.Title}
            </NavLink>
            <ul>
              {subModules
                .filter((subModule) => subModule.AuGrpID === module.AuGrpID)
                .map((subModule) => (
                  <li key={subModule.AuGrpID}>
                    <NavLink to={subModule.Link}>
                      {subModule.ICon && (
                        <i className={`fa ${subModule.ICon}`}></i>
                      )}
                      {subModule.Title}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
