import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  View
} from "react-native";
import { Modal } from "@ant-design/react-native";
import { AS, StyleConsts } from "../Assets/consts";
import AsyncStorage from "@react-native-community/async-storage";
import logger from "../logger";
const caller = "BeachesModal.js";

const BeachesModal = ({ onChooseBeach }) => {
  const [beaches, setBeaches] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      const userToken = await AsyncStorage.getItem(AS.userToken);
      const lifeGuardId = await AsyncStorage.getItem(AS.lifeGuardId);
      fetch(
        `https://drone-guard-debriefing-server.herokuapp.com/beachesByLifeGuard/${lifeGuardId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            authorization: "Bearer " + userToken
          }
        }
      )
        .then(async response => {
          if (response.status === 200) {
            let beachesResponse = await response.json();
            logger(
              "DEV",
              `number of beaches returned = ${beachesResponse.length}`,
              caller
            );
            beachesResponse = beachesResponse.map(beach => {
              return { ...beach, label: beach.name };
            });
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
      style={styles.modal}
    >
      <View style={styles.beaches}>
        {error ? (
          <View>
            <Text>Failed to fetch beaches</Text>
          </View>
        ) : (
          [
            <Text style={styles.title}>
              Choose your working beach for today
            </Text>,
            beaches && (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.beachesContent}
                persistentScrollbar={true}
              >
                {beaches.map((beach, i) => (
                  <TouchableOpacity
                    onPress={() => onChooseBeach(beach)}
                    key={i}
                  >
                    <Text style={styles.beach}>{beach.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )
          ]
        )}
      </View>
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
    height: 350,
    display: "flex",
    marginBottom: 10
  },
  beachesContent: {
    alignItems: "center"
  },
  beach: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 10
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
    alignSelf: "center",
    fontWeight: "bold"
  },
  scrollView: {
    alignSelf: "center",
    width: "90%",
    marginTop: 10
  }
});

export default BeachesModal;
