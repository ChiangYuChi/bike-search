$(function () {
  let API =
    "https://cors-anywhere.herokuapp.com/https://data.ntpc.gov.tw/api/datasets/71CD1490-A2DF-4198-BEF1-318479775E8A/json?page=0&size=600";
  const vm = new Vue({
    el: "#app",
    data: {
      loading: true,
      listsData: [],
      filterMode: false,
      filterData: [],
      pageData: [],
      pagination: [],
      currentPage: 1,
      perPage: 30,
      modalSna: "",
      filterInputData: {
        sarea: "",
        sna: "",
        ar: "",
        sno: false,
      },
      googleMap: {
        map: {},
        marker: {},
        infowindow: {},
      },
      filterOpen: false,
    },
    computed: {
      getArea() {
        const areas = this.listsData.map((list, i) => list.sarea);
        return areas.filter((area, i, arr) => arr.indexOf(area) == i);
      },
      getSite() {
        const inputArea = this.filterInputData.sarea;
        if (inputArea == "") {
          return "";
        } else {
          const site = [];
          this.listsData.forEach((list, i) => {
            if (list.sarea == inputArea) {
              site.push(list.sna);
            } else {
              return;
            }
          });
          return site.filter((site, i, arr) => arr.indexOf(site) == i);
        }
      },
      getAdd() {
        const inputAdd = this.filterInputData.ar;
        if (inputAdd == "") {
          return "";
        } else {
          const add = [];
          this.listsData.forEach((list, i) => {
            if (list.ar == inputAdd) {
              add.push(list.ar);
            } else {
              return;
            }
          });
          return add.filter((add, i, arr) => arr.indexOf(add) == i);
        }
      },
      showPages() {
        let pageRange = {
          min:
            this.currentPage % 10 == 0
              ? this.currentPage - 9
              : Math.floor(this.currentPage / 10) * 10 + 1,
          max:
            this.currentPage % 10 == 0
              ? this.currentPage
              : Math.ceil(this.currentPage / 10) * 10,
        };
        // max 計算超過 pagination 總長度的話，max 就改為總長度
        if (pageRange.max > this.pagination.length)
          pageRange.max = this.pagination.length;
        return this.pagination.filter((page, i) => {
          return page >= pageRange.min - 1 && page <= pageRange.max - 1;
        });
      },
    },
    methods: {
      getAPIData() {
        axios
          .get(API)
          .then(function (response) {
            vm.listsData = response.data;
            vm.combineDataByPage();
          })
          .catch(function (error) {
            alert("資料載入有誤，請稍後再試! error: " + error);
          });
      },
      combineDataByPage() {
        const dataCopy = JSON.parse(JSON.stringify(vm.listsData));
        const perPage = 30;
        const totalPage = Math.ceil(parseInt(dataCopy.length / perPage));
        for (let i = 0; i < totalPage; i++) {
          this.pageData.push(dataCopy.splice(0, 20));
          vm.pagination.push(i);
        }
        this.loading = false;
      },
      movePage(move) {
        if (move == "prev") {
          this.currentPage--;
        } else if (move == "next") {
          this.currentPage++;
        } else {
          this.currentPage = parseInt(move);
        }
      },
      filterLists() {
        //判斷是否為 filter mode
        if (
          this.filterInputData.sarea == "" &&
          this.filterInputData.sna == ""
        ) {
          this.filterMode = false;
        } else {
          this.filterMode = true;
        }
        debugger;
        let tempData = JSON.parse(JSON.stringify(vm.listsData));
        console.log(tempData);
        for (let key in this.filterInputData) {
          if (this.filterInputData[key] !== "" && key !== "sno") {
            tempData = tempData.filter((list, i) => {
              if (key == "sarea") {
                return JSON.parse(list[key] == this.filterInputData[key]);
              } else if (key == "sna") {
                return JSON.parse(list[key] == this.filterInputData[key]);
              } else {
                return JSON.parse(list[key] == this.filterInputData[key]);
              }
            });
          }
        }
        this.filterData = tempData.filter((list, i) => {
          return true;
        });
      },
      showMap(data) {
        this.modalSna = data.sna;
        const _this = this;
        const pos = {
          lat: JSON.parse(data.lat),
          lng: JSON.parse(data.lng),
        };
        const icon =
          "https://raw.githubusercontent.com/ChiangYuChi/youbike/master/img/electric-bike.png";
        const address = data.ar.replace(/\(.+\)/g, "");
        const content = `
            <div>
              <h5>${data.sna}</h5>
              <p>
                <a href='https://www.google.com/maps/place/${address}' target='_blank'>
                  ${data.ar}
                </a>
              </p>
            </div>
          `;
        this.googleMap.map = new google.maps.Map(
          document.getElementById("map"),
          {
            center: pos,
            zoom: 15,
          }
        );
        this.googleMap.marker = new google.maps.Marker({
          position: pos,
          map: _this.googleMap.map,
          icon: icon,
          animation: google.maps.Animation.DROP,
        });
        this.googleMap.infowindow = new google.maps.InfoWindow({
          content: content,
        });
        this.googleMap.infowindow.open(
          this.googleMap.map,
          this.googleMap.marker
        );
      },
    },
    watch: {
      "filterInputData.sna": function (val) {
        // vm.filterLists();
        this.debounce(val);
      },
      "filterInputData.sarea": function (val) {
        this.filterInputData.sna = "";
        this.debounce(val);
        vm.filterLists(val);
      },
    },
    created() {
      // window.addEventListener('load', () => {
      //     this.initMap();
      // });
      this.debounce = _.debounce(this.filterLists, 500);
    },
    mounted() {
      this.getAPIData();
    },
  });
});
