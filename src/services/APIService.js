import axios from "axios";
import { authHeader, LOCALSTORAGE_NAME } from "../auth-header";

const apiClient = axios.create({
  withCredentials: true,
  headers: authHeader()
});

const simpleClient = axios.create();

export default {
  isAuthorized() {
    return apiClient
      .get("/api/v1/authorized")
      .then(() => true)
      .catch(() => false);
  },
  login(token) {
    apiClient.defaults.headers["Authorization"] = "Bearer " + token;
    return apiClient
      .get("/api/v1/authorized")
      .then(() => {
        localStorage.setItem(
          LOCALSTORAGE_NAME,
          JSON.stringify({
            authdata: window.btoa(token)
          })
        );
        return true;
      })
      .catch(() => {
        localStorage.removeItem(LOCALSTORAGE_NAME);
        return false;
      });
  },
  logout() {
    localStorage.removeItem(LOCALSTORAGE_NAME);
    return new Promise(function(resolve) {
      resolve("Logged out.");
    });
  },
  getCAs() {
    return apiClient.get("/api/v1/cas");
  },
  getCA(handle) {
    return apiClient.get("/api/v1/cas/" + handle);
  },
  getROAs(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/routes");
  },
  getRepo(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/repo");
  },
  getRepoStatus(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/repo/status");
  },
  getParents(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/parents");
  },
  getParentContact(handle, parent) {
    return apiClient.get("/api/v1/cas/" + handle + "/parents/" + parent);
  },
  updateROAs(handle, delta, trial) {
    return apiClient
      .post("/api/v1/cas/" + handle + "/routes" + (trial ? "/try" : ""), delta)
      .catch(error => {
        if (error.response && error.response.data) {
          return Promise.reject({
            data: error.response.data
          });
        }
        return Promise.reject({
          data: {
            code: -1
          }
        });
      });
  },
  updateROAsDryRun(handle, delta) {
    return apiClient.post("/api/v1/cas/" + handle + "/routes/analysis/dryrun", delta);
  },
  createCA(handle) {
    return apiClient.post("/api/v1/cas", {
      handle
    });
  },
  getChildRequestXML(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/child_request.xml");
  },
  addParentResponse(handle, xml, name) {
    return apiClient.post("/api/v1/cas/" + handle + "/parents-xml/" + name, xml).catch(error => {
      if (error.response && error.response.data) {
        return Promise.reject({
          data: error.response.data
        });
      }
      return Promise.reject({
        data: {
          code: -1
        }
      });
    });
  },
  getRepoRequestXML(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/repo/request.xml");
  },
  addRepoResponse(handle, xml) {
    return apiClient.post("/api/v1/cas/" + handle + "/repo", xml).catch(error => {
      if (error.response && error.response.data) {
        return Promise.reject({
          data: error.response.data
        });
      }
      return Promise.reject({
        data: {
          code: -1
        }
      });
    });
  },
  getKrillStats() {
    return apiClient.get("/stats/info");
  },
  getLatestKrillVersion() {
    return simpleClient.get("https://api.github.com/repos/nlnetlabs/krill/releases/latest");
  },
  getBGPAnalysis(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/routes/analysis/full");
  },
  testbedAddChild(child, asn_res, ipv4_res, ipv6_res, id_cert) {
    return simpleClient.post("/testbed/children", {
      handle: child,
      resources: {
        asn: typeof asn_res !== "undefined" ? asn_res : "",
        v4: typeof ipv4_res !== "undefined" ? ipv4_res : "",
        v6: typeof ipv6_res !== "undefined" ? ipv6_res : ""
      },
      auth: {
        rfc8183: {
          tag: null,
          child_handle: child,
          id_cert: id_cert
        }
      }
    });
  },
  testbedGetParentResponseXML(child) {
    return simpleClient.get("/testbed/children/" + child + "/parent_response.xml");
  },
  testbedRemoveChild(child) {
    return simpleClient.delete("/testbed/children/" + child);
  },
  testbedAddPublisher(publisher_handle, publisher_request_xml) {
    return simpleClient.post("/testbed/publishers", {
      tag: null,
      publisher_handle: publisher_handle,
      id_cert: publisher_request_xml
    });
  },
  testbedGetRepositoryResponseXML(publisher) {
    return simpleClient.get("/testbed/publishers/" + publisher + "/response.xml");
  },
  testbedRemovePublisher(publisher) {
    return simpleClient.delete("/testbed/publishers/" + publisher);
  },
  testbedEnabled() {
    return simpleClient.get("/testbed/enabled");
  },
  getROAsSuggestions(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/routes/analysis/suggest");
  },
  syncParents() {
    return apiClient.post("/api/v1/bulk/cas/sync/parent");
  },
  syncRepo() {
    return apiClient.post("/api/v1/bulk/cas/sync/repo");
  }
};
