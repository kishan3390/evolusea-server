import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router-dom";
import "./App.css";
import WithEntitlement from "./components/WithEntitlement.tsx";
import WithoutEntitlement from "./components/WithoutEntitlement.tsx";
import LoginPage from "./pages/login";
import LandingPage from "./pages/landingPage";
import PaywallPage from "./pages/paywall";
import SuccessPage from "./pages/success";
import { loadPurchases } from "./util/PurchasesLoader.ts";
import RCPaywallPage from "./pages/rc_paywall";
import RCPaywallNoOfferingPassedPage from "./pages/rc_paywall_no_offering_passed";
import RCPaywallNoTargetElementPassedPage from "./pages/rc_paywall_no_target_element_passed";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/logout",
    loader: () => {
      throw redirect("/");
    },
  },
  {
    path: "/paywall/:app_user_id",
    loader: loadPurchases,
    element: (
      <WithoutEntitlement>
        <PaywallPage />
      </WithoutEntitlement>
    ),
  },
  {
    path: "/rc_paywall/:app_user_id",
    loader: loadPurchases,
    element: (
      <WithoutEntitlement>
        <RCPaywallPage />
      </WithoutEntitlement>
    ),
  },
  {
    path: "/rc_paywall_no_offering/:app_user_id",
    loader: loadPurchases,
    element: (
      <WithoutEntitlement>
        <RCPaywallNoOfferingPassedPage />
      </WithoutEntitlement>
    ),
  },
  {
    path: "/rc_paywall_no_target_element/:app_user_id",
    loader: loadPurchases,
    element: (
      <WithoutEntitlement>
        <RCPaywallNoTargetElementPassedPage />
      </WithoutEntitlement>
    ),
  },
  {
    path: "/success/:app_user_id",
    loader: loadPurchases,
    element: (
      <WithEntitlement>
        <SuccessPage />
      </WithEntitlement>
    ),
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
