import React, {useEffect} from 'react';
import LineLogin from '@xmartlabs/react-native-line';
import {AuthProvider} from '@/contexts/AuthContext';
import {HomeScreen} from '@/screens/HomeScreen';
import {Config} from '@/constants/config';

function App(): React.JSX.Element {
  useEffect(() => {
    LineLogin.setup({channelId: Config.line.channelId});
  }, []);

  return (
    <AuthProvider>
      <HomeScreen />
    </AuthProvider>
  );
}

export default App;
