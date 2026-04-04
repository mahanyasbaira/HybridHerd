const { GraphQLSchema, GraphQLObjectType, GraphQLField, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLList, GraphQLNonNull, GraphQLBoolean } = require('graphql');

const TelemetryType = new GraphQLObjectType({
  name: 'Telemetry',
  fields: () => ({
    noseRing: { type: new GraphQLList(NoseRingReadingType) },
    collar: { type: new GraphQLList(CollarReadingType) },
    earTag: { type: new GraphQLList(EarTagReadingType) },
  }),
});

const NoseRingReadingType = new GraphQLObjectType({
  name: 'NoseRingReading',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    temperature_c: { type: GraphQLFloat },
    respiratory_rate: { type: GraphQLFloat },
    recorded_at: { type: GraphQLString },
    created_at: { type: GraphQLString },
  }),
});

const CollarReadingType = new GraphQLObjectType({
  name: 'CollarReading',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    chew_frequency: { type: GraphQLFloat },
    cough_count: { type: GraphQLInt },
    recorded_at: { type: GraphQLString },
    created_at: { type: GraphQLString },
  }),
});

const EarTagReadingType = new GraphQLObjectType({
  name: 'EarTagReading',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    behavior_index: { type: GraphQLFloat },
    recorded_at: { type: GraphQLString },
    created_at: { type: GraphQLString },
  }),
});

const AlertType = new GraphQLObjectType({
  name: 'Alert',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    animal_id: { type: new GraphQLNonNull(GraphQLInt) },
    previous_risk: { type: GraphQLString },
    current_risk: { type: new GraphQLNonNull(GraphQLString) },
    ml_score: { type: GraphQLFloat },
    triggered_at: { type: GraphQLString },
    acknowledged: { type: GraphQLBoolean },
    acknowledged_at: { type: GraphQLString },
    animal: { type: AnimalType },
    telehealthAction: { type: TelehealthActionType },
  }),
});

const TelehealthActionType = new GraphQLObjectType({
  name: 'TelehealthAction',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    alert_id: { type: new GraphQLNonNull(GraphQLInt) },
    rancher_note: { type: GraphQLString },
    rancher_sent_at: { type: GraphQLString },
    vet_note: { type: GraphQLString },
    vet_action: { type: GraphQLString },
    vet_responded_at: { type: GraphQLString },
    status: { type: GraphQLString },
    created_at: { type: GraphQLString },
  }),
});

const AnimalType = new GraphQLObjectType({
  name: 'Animal',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    tag_id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLString },
    breed: { type: GraphQLString },
    birth_date: { type: GraphQLString },
    created_at: { type: GraphQLString },
    latest_risk: { type: GraphQLString },
    latestAlert: { type: AlertType },
    recentTelemetry: { type: TelemetryType },
  }),
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    animals: {
      type: new GraphQLList(AnimalType),
      args: {
        riskFilter: { type: GraphQLString },
      },
    },
    animal: {
      type: AnimalType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
      },
    },
    alerts: {
      type: new GraphQLList(AlertType),
      args: {
        acknowledged: { type: GraphQLBoolean },
      },
    },
    telehealthActions: {
      type: new GraphQLList(TelehealthActionType),
      args: {
        status: { type: GraphQLString },
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: QueryType,
});

module.exports = schema;
