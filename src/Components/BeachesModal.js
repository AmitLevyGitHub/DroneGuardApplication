import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  View
} from "react-native";
import { Modal } from "@ant-design/react-native";
import {AS, StyleConsts} from "../Assets/consts";
import AsyncStorage from "@react-native-community/async-storage";
import logger from "..//logger";
const caller = "BeachesModal.js";

const BeachesModal = ({ onChooseBeach }) => {
  const [beaches, setBeaches] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      const userToken = await AsyncStorage.getItem(AS.userToken);

      fetch("https://drone-guard-debriefing-server.herokuapp.com/beaches", {
        method: "GET",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          authorization: "Bearer " + userToken
        }
      })
        .then(async response => {
          if (response.status === 200) {
            const beachesResponse = await response.json();
            logger(
              "DEV",
              `number of beaches returned = ${beachesResponse.length}`,
              caller
            );
            setBeaches(beachesResponse);
          } else {
            throw new Error("Failed to fetch beaches");
          }
        })
        .catch(e => {
          setError(true);
          logger("WARNING", e.message || e, caller, "/beaches");
        });
    })();
  }, []);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      closable={false}
      visible={true}
      title="Choose Beach"
      style={styles.modal}
    >
      <ScrollView
        style={styles.beaches}
        contentContainerStyle={styles.beachesContent}
      >
        {error ? (
          <View>
            <Text>Failed to fetch beaches</Text> //TODO TAKE CARE
          </View>
        ) : (
          beaches &&
          beaches.map((beach, i) => (
            <TouchableOpacity onPress={() => onChooseBeach(beach)} key={i}>
              <Text style={styles.beach}>{beach.name}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    width: StyleConsts.modal.width,
    height: StyleConsts.modal.height
  },
  beaches: {
    width: "100%",
    height: "90%",
    display: "flex",
    marginTop: 10,
    marginBottom: 10
  },
  beachesContent: {
    alignItems: "center"
  },
  beach: {
    fontSize: 25,
    marginTop: 10,
    marginBottom: 10
  }
});

export default BeachesModal;
