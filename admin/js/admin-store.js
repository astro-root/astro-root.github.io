(function () {
  "use strict";

  /*
    管理画面のデータ永続化レイヤー。
    LocalStorage をバックエンドとして使用しているが、
    インターフェースは Firestore 互換に近づけて設計している。

    将来 Firebase へ移行する場合は AdminStore の各メソッド内部実装のみ
    差し替えれば、呼び出し側(dashboard.html等)のコードは変更不要。
  */

  var PREFIX = "lab_admin_data_";

  var AdminStore = {};
  window.AdminStore = AdminStore;

  function readCollection(name) {
    var raw;
    try {
      raw = localStorage.getItem(PREFIX + name);
    } catch (e) {
      console.error("Store read failed:", e);
      return [];
    }
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Store parse failed:", e);
      return [];
    }
  }

  function writeCollection(name, items) {
    try {
      localStorage.setItem(PREFIX + name, JSON.stringify(items));
      return true;
    } catch (e) {
      console.error("Store write failed:", e);
      return false;
    }
  }

  function genId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function nowIso() {
    return new Date().toISOString();
  }

  /* ── 初期データロード：LocalStorageが空ならJSONファイルから読み込む ── */
  AdminStore.initFromJson = function (name, jsonPath, extractKey) {
    return new Promise(function (resolve) {
      var existing = readCollection(name);
      if (existing !== null) {
        resolve(existing);
        return;
      }
      fetch(jsonPath)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var items = extractKey ? (data[extractKey] || []) : (Array.isArray(data) ? data : []);
          writeCollection(name, items);
          resolve(items);
        })
        .catch(function () {
          writeCollection(name, []);
          resolve([]);
        });
    });
  };

  AdminStore.getAll = function (name) {
    return readCollection(name) || [];
  };

  AdminStore.getById = function (name, id) {
    var items = AdminStore.getAll(name);
    return items.filter(function (i) { return i.id === id; })[0] || null;
  };

  AdminStore.create = function (name, item, idPrefix) {
    var items = AdminStore.getAll(name);
    var record = Object.assign({}, item);
    if (!record.id) record.id = genId(idPrefix || name);
    record.createdAt = record.createdAt || nowIso();
    record.updatedAt = nowIso();
    items.unshift(record);
    writeCollection(name, items);
    return record;
  };

  AdminStore.update = function (name, id, patch) {
    var items = AdminStore.getAll(name);
    var idx = items.findIndex(function (i) { return i.id === id; });
    if (idx === -1) return null;
    items[idx] = Object.assign({}, items[idx], patch, { updatedAt: nowIso() });
    writeCollection(name, items);
    return items[idx];
  };

  AdminStore.remove = function (name, id) {
    var items = AdminStore.getAll(name);
    var filtered = items.filter(function (i) { return i.id !== id; });
    writeCollection(name, filtered);
    return filtered.length !== items.length;
  };

  AdminStore.exportJson = function (name, wrapperKey) {
    var items = AdminStore.getAll(name);
    var wrapper = {};
    wrapper[wrapperKey || name] = items;
    return JSON.stringify(wrapper, null, 2);
  };

  AdminStore.clearAll = function (name) {
    try {
      localStorage.removeItem(PREFIX + name);
      return true;
    } catch (e) {
      return false;
    }
  };
})();
