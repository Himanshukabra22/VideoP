import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

// import screens
import Auth from "../../../db/app/auth";
import Home from "../../../my-app/app";
import Upload from "../../../db/app/upload";

const Stack = createNativeStackNavigator();

const Routes = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Upload" component={Upload} />
            <Stack.Screen name="Auth" component={Auth} />
        </Stack.Navigator>
    )
};

export default Routes;