import React, {} from 'react';
import { SafeAreaView, StatusBar } from 'react-native';

// screen
import Home from './src/screens/home';

// constants
import Colors from './src/constants/colors';
import { SCREEN_WIDTH as width } from './src/constants/screen';

const App = () => {
  return (
    <SafeAreaView>
      <StatusBar backgroundColor={Colors.bg} barStyle={'dark-content'} />
      <Home />
    </SafeAreaView>
  );
}

export default App;
