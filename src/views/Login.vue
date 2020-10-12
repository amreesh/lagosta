<template>
  <div class="login">
    <el-row type="flex" class="row-index" justify="center">
      <el-col :span="10">
        <el-card class="box-card">
          <div class="text item">
            <el-form :model="form" :rules="rules" :inline="true" ref="loginForm" @submit.prevent.native="submitForm">
              <el-form-item :label="$t('login.password')" prop="token">
                <el-input
                  type="password"
                  :placeholder="$t('login.placeholder')"
                  v-model="form.token"
                  clearable
                  @keyup.enter.native="submitForm"
                ></el-input>
                <div class="el-form-item__error" slot="error" slot-scope="scope">
                  <span v-html="scope.error"></span>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitForm" v-loading="loading">{{
                  $t("login.signin")
                }}</el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="loginWithProvider" v-loading="loading">
                  Login with Provider
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row type="flex" class="row-index alert-row" justify="center">
      <el-col :span="10">
        <el-alert type="error" v-if="error" :closable="false">{{ error }}</el-alert>
      </el-col>
    </el-row>
    <div class="route-left">
      <img src="@/assets/images/route_left.svg" />
    </div>
    <div class="route-right">
      <img src="@/assets/images/route_right.svg" />
    </div>
  </div>
</template>

<script>
import router from "../router";
import APIService from "@/services/APIService.js";
// import * as ClientOAuth2 from "client-oauth2";

export default {
  data() {
    const checkToken = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("login.required")));
      } else {
        if (
          value
            .toLowerCase()
            .replace(/-/gi, "")
            .indexOf("correcthorsebatterystaple") === 0
        ) {
          callback(new Error(this.$t("login.copied")));
        } else {
          callback();
        }
      }
    };
    return {
      form: {
        token: ""
      },
      rules: {
        token: [
          {
            required: true,
            validator: checkToken
          }
        ]
      },
      submitted: false,
      loading: false,
      returnUrl: "",
      error: ""
    };
  },
  created() {
    this.returnUrl = this.$route.query.returnUrl || "/";
    if (this.$route.query.token) {
      this.form.token = this.$route.query.token;
      this.form.id = this.$route.query.id;
      this.login();
    }
    // this.githubAuth = new ClientOAuth2({
    //   clientId: 'ee111e6067e9a271cdb3',
    //   // clientSecret: '*****',
    //   // accessTokenUri: 'https://github.com/login/oauth/access_token',
    //   authorizationUri: 'https://github.com/login/oauth/authorize',
    //   redirectUri: 'https://localhost:3000/auth/github/callback',
    //   scopes: ["read:user"]
    // });
    // this.githubAuth.code.getToken(window.location)
    // .then(function (user) {
    //   console.log("XIMON: OKAY");
    //   console.log(user);
    // })
    // .catch(e => {
    //   console.log("XIMON: ERROR: " + e);
    // });
  },
  methods: {
    login() {
      this.submitted = true;

      const self = this;
      this.loading = true;

      APIService.login(this.form.id, this.form.token).then(success => {
        if (success) {
          this.$emit("auth-event");
          router.push(this.returnUrl);
        } else {
          self.error = this.$t("login.error");
          self.loading = false;
        }
      });
    },
    submitForm() {
      this.$refs["loginForm"].validate(valid => {
        if (valid) {
          this.login();
        } else {
          return false;
        }
      });
    },
    loginWithProvider() {
      APIService.getLoginUri().then(response => {
        window.location.href = response.data;
      })
      .catch(e => {
        console.log("Error fetching login URI: " + e)
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.login {
  margin-top: 40px;
}
.box-card {
  .el-form {
    padding: 2rem;
    text-align: center;
    .el-form-item {
      margin-bottom: 0 !important;
    }
  }
  .el-form-item__error {
    line-height: 18px !important;
  }
}
.alert-row {
  margin-top: 1rem;
}
.row-index {
  z-index: 3;
}
.route-left {
  position: fixed;
  left: -100px;
  bottom: -280px;
  z-index: 2;
}
.route-right {
  position: fixed;
  right: -196px;
  top: 40px;
  z-index: 2;
}
</style>
