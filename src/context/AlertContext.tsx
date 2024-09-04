import { createContext, useContext, useState } from "react";
import { AlertDto } from "../interfaces/Common/AlertManager";

// Define context type
interface PopupContextType {
    showPopup: (data?: AlertDto) => void;
    closePopup: () => void;
    popupData: AlertDto | undefined;
    isPopupOpen: boolean;
}

// Create context
const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = (): PopupContextType => {
    const context = useContext(PopupContext);
    if (context === undefined) {
        throw new Error("usePopup must be used within a PopupProvider");
    }
    return context;
};

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupData, setPopupData] = useState<AlertDto | undefined>(undefined);

    const showPopup = (data?: AlertDto) => {
        setPopupData(data);
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
    };

    return (
        <PopupContext.Provider value={{ showPopup, closePopup, popupData, isPopupOpen }}>
            {children}
        </PopupContext.Provider>
    );
};
