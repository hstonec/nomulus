// Copyright 2019 The Nomulus Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package google.registry.model.transaction;

import google.registry.model.ofy.DatastoreTransactionManager;
import google.registry.persistence.DaggerPersistenceComponent;
import javax.persistence.EntityManagerFactory;

/** Factory class to create {@link TransactionManager} instance. */
public class TransactionManagerFactory {

  private static final DatastoreTransactionManager DSTM = createDatastoreTransactionManager();
  private static final DatabaseTransactionManager DBTM = createDatabaseTransactionManager();

  private TransactionManagerFactory() {}

  private static DatastoreTransactionManager createDatastoreTransactionManager() {
    return new DatastoreTransactionManager(null);
  }

  private static DatabaseTransactionManager createDatabaseTransactionManager() {
    EntityManagerFactory emf = DaggerPersistenceComponent.create().appEngineEntityManagerFactory();
    Runtime.getRuntime().addShutdownHook(new Thread(emf::close));
    return new DatabaseTransactionManager(emf);
  }

  /** Returns {@link TransactionManager} instance. */
  public static TransactionManager tm() {
    // TODO: Returns DatabaseTransactionManager when we want to migrate all traffic
    //  to Cloud Sql.
    return DSTM;
  }

  public static DatabaseTransactionManager dbtm() {
    return DBTM;
  }
}
