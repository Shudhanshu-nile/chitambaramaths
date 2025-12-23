import {View,Text} from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

import { Colors } from '../assests/style';




export const toastConfig = {
  
  successToast: ({text1, props}) => (
    <View
      style={{
        borderRadius: 10,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        backgroundColor: Colors.primaryTheme,
        flexDirection:'row'
        
      }}>
        
      <Text style={{color:Colors.white,fontSize:14,fontFamily:'Poppins-Regular'}}>{text1}</Text>
    </View>
  ),
  errorToast: ({text1, props}) => (
    <View
      style={{
        borderRadius: 20,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        backgroundColor: 'tomato',
      }}>
      <Text>{text1}</Text>
    </View>

  ),
  // success: (props) => (
  //       <BaseToast
  //         {...props}
          
  //         style={{
  //           borderLeftColor: '#ADC430',
  //           borderColor: '#ADC430',
  //           borderWidth: 1,
  //           height: 60,
  //           width: '90%',
  //         }}
  //         contentContainerStyle={{ paddingHorizontal: 15 }}
  //         text1Style={{
  //           fontSize: 12,
  //           fontWeight: '400',
  //           color: 'black',
  //         }}
  //         text2Style={{
  //           fontSize: 14,
  //           fontWeight: '400',
  //           color: 'black',
  //         }}
          
  //       />
  //     ),
      
  //     error: (props) => (
  //       <ErrorToast
  //         {...props}
  //         text1Style={{
  //           fontSize: 14,
  //           fontWeight: '400',
  //           color: 'black',
          
  //         }}
  //        style={{zIndex:1}}
  //         text2Style={{
  //           fontSize: 14,
  //           fontWeight: '400',
  //           color: 'black',
  //         }}
         
  //       />
  //     ),
};
// import React from "react";
// import { View, Text, StyleSheet } from "react-native";
// import Toast from "react-native-toast-message";
// import Color from "./Color";

// export const toastConfig = {
//   success: ({ text1, text2, props }) => (
//     <View style={styles.successToast}>
//       <Text style={styles.toastTitle}>{text1}</Text>
//       {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
//     </View>
//   ),
//   error: ({ text1, text2, props }) => (
//     <View style={styles.errorToast}>
//       <Text style={styles.toastTitle}>{text1}</Text>
//       {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
//     </View>
//   ),
// };
// const styles = StyleSheet.create({
//   successToast: {
//     backgroundColor: Color.PRIMARY, // Custom background color
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     borderRadius: 10,
//     width: "90%",
//     alignSelf: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   errorToast: {
//     backgroundColor: "red",
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     borderRadius: 10,
//     width: "90%",
//     alignSelf: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   toastTitle: {
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "white",
//   },
//   toastMessage: {
//     fontSize: 12,
//     color: "white",
//     marginTop: 2,
//   },
// });
// export default toastConfig;