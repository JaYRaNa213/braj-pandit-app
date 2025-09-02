// withSafeArea.tsx
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const WithSafeArea = (
  WrappedComponent,
  edges = ['bottom'],
  style = { flex: 1 },
) => {
  return (props) => (
    <SafeAreaView style={style} edges={edges}>
      <WrappedComponent {...props} />
    </SafeAreaView>
  );
};

export default WithSafeArea;
