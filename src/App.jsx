import { Routes, Route } from "react-router-dom";
import Bendword from "./bendword/Bendword";
import KidneyOS from "./kidneyos/KidneyOS";
import PrivacyIndex from "./pages/PrivacyIndex";
import PrivacyPillLedger from "./pages/PrivacyPillLedger";
import PrivacyFoodLedgerKidney from "./pages/PrivacyFoodLedgerKidney";
import PrivacyMyGrocery from "./pages/PrivacyMyGrocery";
import PrivacyWhatILiked from "./pages/PrivacyWhatILiked";
import PrivacyKidneyOS from "./pages/PrivacyKidneyOS";
import PrivacyBendword from "./pages/PrivacyBendword";
import PrivacyTidebreaker from "./pages/PrivacyTidebreaker";
import PrivacyBtownSolitaire from "./pages/PrivacyBtownSolitaire";
import PrivacyTwelveSeams from "./pages/PrivacyTwelveSeams";
import HomePage from "./home/HomePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/bendword" element={<Bendword />} />
      <Route path="/bendword/index.html" element={<Bendword />} />
      <Route path="/kidneyos" element={<KidneyOS />} />
      <Route path="/kidneyos/renal-diet-tracker" element={<KidneyOS />} />
      <Route path="/kidneyos/dialysis-tracker" element={<KidneyOS />} />
      <Route path="/kidneyos/caregivers" element={<KidneyOS />} />
      <Route path="/privacy" element={<PrivacyIndex />} />
      <Route path="/privacy-policy" element={<PrivacyIndex />} />
      <Route path="/privacy/pillledger" element={<PrivacyPillLedger />} />
      <Route path="/privacy/food-ledger-kidney" element={<PrivacyFoodLedgerKidney />} />
      <Route path="/privacy/mygrocery-ezscan" element={<PrivacyMyGrocery />} />
      <Route path="/privacy/what-i-liked" element={<PrivacyWhatILiked />} />
      <Route path="/privacy/kidneyos" element={<PrivacyKidneyOS />} />
      <Route path="/privacy/bendword" element={<PrivacyBendword />} />
      <Route path="/privacy/tidebreaker" element={<PrivacyTidebreaker />} />
        <Route path="/privacy/btownsolitaire" element={<PrivacyBtownSolitaire />} />
        <Route path="/privacy/twelveseams" element={<PrivacyTwelveSeams />} />

    </Routes>
  );
}
