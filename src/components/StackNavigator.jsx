import React from 'react';
import { useSelector } from 'react-redux';
import {
  createStackNavigator,
  TransitionPresets,
} from '@react-navigation/stack';

import AgeSelectionScreen from '../screens/AgeSelectionScreen';
import AskQuestionScreen from '../screens/AskQuestionScreen';
import AstrologerProfile from '../screens/AstrologerProfile';
import BlogDetails from '../screens/BlogDetails';
import Blogs from '../screens/Blogs';
import BookingConfirmation from '../screens/BookingConfirmation';
import BookingScreen from '../screens/BookingScreen';
import ActiveChat from '../screens/chat/ActiveChat';
import AllChats from '../screens/chat/AllChats';
import SingleChat from '../screens/chat/SingleChat';
import ChatIntakeForm from '../screens/ChatIntakeForm';
import Community from '../screens/community/Community';
import CommunityQuestion from '../screens/community/CommunityQuestion'; // incoming me CommunityPost hai
import CreateQuestion from '../screens/community/CreateQuestion';
import Compatibility from '../screens/Compatibility';
import CompatibilityContent from '../screens/CompatibilityContent';
import ConsultOnCallDetails from '../screens/ConsultOnCallDetails';
import CustomerSupport from '../screens/CustomerSupport';
import CustomerSupportChatScreen from '../screens/CustomerSupportChatScreen';
import DeleteAccount from '../screens/DeleteAccount';
import Following from '../screens/Following';
import Footer from '../screens/Footer';
import FreeAstrologers from '../screens/FreeAstrologers';
import GoogleMeetScreen from '../screens/GoogleMeetScreen';
import KundliInputs from '../screens/KundiInputs';
import Kundli from '../screens/Kundli';
import KundliDetails from '../screens/KundliDetails';
import KundliMatching from '../screens/KundliMatching';
import KundliMatchingDetails from '../screens/KundliMatchingDetails';
import Login from '../screens/Login';
import LoveCalculator from '../screens/LoveCalculator';
import LoveScore from '../screens/LoveScore';
import MobileLogin from '../screens/MobileLogin';
import Palm from '../screens/Palm';
import PalmReadingResult from '../screens/PalmReadingResult';
import PalmReadingHistory from '../screens/PalmReadingHistory';
import PaymentInformation from '../screens/PaymentInformation';
import ProblemChecklistScreen from '../screens/ProblemChecklistScreen';
import Recharge from '../screens/Recharge';
import RelationShipCompatibilityGrid from '../screens/RelationShipCompatibilityGrid';
import ResetPassword from '../screens/ResetPassword';
import Reviews from '../screens/Reviews';
import Search from '../screens/Search';
import Settings from '../screens/Settings';
import Signup from '../screens/Signup';
import TempleDetails from '../screens/TempleDetails';
import UserProfile from '../screens/UserProfile';
import YoutubeVideos from '../screens/YoutubeVideos';
import Callcomponent from './Callcomponent';
import ReferAndEarn from '../screens/ReferAndEarn';
import Temples from '../screens/Temples';
import GeneralHoroscope from '../screens/GeneralHoroscope';
import UserOptions from '../screens/UserOptions'; // only in current
import LiveStreamViewer from '../screens/LiveStreamViewer'; // only in incoming
import LivePlayer from '../screens/LivePlayer'; // only in incoming
import AllNewAstrologersLive from '../screens/AllNewAstrologersLive';
import AIAstroChat from '../screens/AIAstroChat';
import AiSessions from '../screens/AiSessions';
import AllAIAstros from '../screens/AllAIAstros';
import AIAstroImages from '../screens/AIAstroImages';

function StackNavigator() {
  const Stack = createStackNavigator();
  const { user } = useSelector((state) => state.user);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#501873' },
        headerTintColor: 'white',
        cardStyle: { backgroundColor: 'white' },
        ...TransitionPresets.ScaleFromCenterAndroid,
      }}
    >
      {!user && (
        <>
          <Stack.Screen name="MobileLogin" component={MobileLogin} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
        </>
      )}
      <Stack.Screen
        name="Footer"
        component={Footer}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Recharge" component={Recharge} />
      <Stack.Screen name="PaymentInformation" component={PaymentInformation} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="AstrologerProfile" component={AstrologerProfile} />
      <Stack.Screen name="Kundli" component={Kundli} />
      <Stack.Screen name="KundliInputs" component={KundliInputs} />
      <Stack.Screen name="KundliDetails" component={KundliDetails} />
      <Stack.Screen name="KundliMatching" component={KundliMatching} />
      <Stack.Screen
        name="KundliMatchingDetails"
        component={KundliMatchingDetails}
      />
      <Stack.Screen name="Compatibility" component={Compatibility} />
      <Stack.Screen
        name="RelationCompatibilityGrid"
        component={RelationShipCompatibilityGrid}
      />
      <Stack.Screen
        name="CompatibilityContent"
        component={CompatibilityContent}
      />
      <Stack.Screen name="LoveCalculator" component={LoveCalculator} />
      <Stack.Screen name="LoveScore" component={LoveScore} />
      <Stack.Screen name="Profile" component={UserProfile} />
      <Stack.Screen name="TempleDetails" component={TempleDetails} />
      <Stack.Screen name="BlogDetails" component={BlogDetails} />
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="Following" component={Following} />
      <Stack.Screen name="CustomerSupport" component={CustomerSupport} />
      <Stack.Screen
        name="CustomerSupportChatScreen"
        component={CustomerSupportChatScreen}
      />
      <Stack.Screen name="ChatIntakeForm" component={ChatIntakeForm} />
      <Stack.Screen name="AllChats" component={AllChats} />
      <Stack.Screen name="YoutubeVideos" component={YoutubeVideos} />
      <Stack.Screen name="SingleChat" component={SingleChat} />
      <Stack.Screen name="Reviews" component={Reviews} />
      <Stack.Screen name="Blogs" component={Blogs} />
      <Stack.Screen name="ActiveChat" component={ActiveChat} />
      <Stack.Screen name="CallComponent" component={Callcomponent} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccount} />
      <Stack.Screen name="FreeAstrologers" component={FreeAstrologers} />
      <Stack.Screen name="Community" component={Community} />
      <Stack.Screen name="CommunityQuestion" component={CommunityQuestion} />
      <Stack.Screen name="CreateQuestion" component={CreateQuestion} />
      <Stack.Screen
        name="ConsultOnCallDetails"
        component={ConsultOnCallDetails}
      />
      <Stack.Screen name="BookingScreen" component={BookingScreen} />
      <Stack.Screen name="GoogleMeet" component={GoogleMeetScreen} />
      <Stack.Screen name="AskQuestionScreen" component={AskQuestionScreen} />
      <Stack.Screen
        name="BookingConfirmation"
        component={BookingConfirmation}
      />
      <Stack.Screen name="AgeSelection" component={AgeSelectionScreen} />
      <Stack.Screen
        name="ProblemChecklist"
        component={ProblemChecklistScreen}
      />
      <Stack.Screen name="Palm" component={Palm} />
      <Stack.Screen name="PalmReadingResult" component={PalmReadingResult} />
      <Stack.Screen name="PalmReadingHistory" component={PalmReadingHistory} />
      <Stack.Screen name="ReferAndEarn" component={ReferAndEarn} />
      <Stack.Screen name="Temples" component={Temples} />
      <Stack.Screen name="GeneralHoroscope" component={GeneralHoroscope} />
      <Stack.Screen name="UserOptions" component={UserOptions} />
      <Stack.Screen name="LiveStreamViewer" component={LiveStreamViewer} />
      <Stack.Screen
        name="LivePlayer"
        component={LivePlayer}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="AIAstroChat" component={AIAstroChat} />
      <Stack.Screen name="AIAstroSessionsHistory" component={AiSessions} />
      <Stack.Screen name="AllAIAstros" component={AllAIAstros} />
      <Stack.Screen name="AIAstroImages" component={AIAstroImages} />
      <Stack.Screen
        name="AllNewAstrologersLive"
        component={AllNewAstrologersLive}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default StackNavigator;
