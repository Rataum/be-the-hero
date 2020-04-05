const request = require('supertest');
const app = require('./../../src/app');
const connection = require('../../src/database/connection');

describe('ONGs and Incidents tests', () => {
    const ong = {
        name: "ONG TEST",
        email: "contato@ongtest.com",
        whatsapp: "11000000000",
        city: "Test City",
        uf: "UF"
    };

    const incident = {
        title: "Test Incident",
        description: "Test Description Incident",
        value: 100,
    };

    let ongId = '';
    let incidentId = '';

    beforeAll(async () => {
        await connection.migrate.rollback();
        await connection.migrate.latest();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    it('should be able to create a new ONG', async () => {
        const response = await request(app)
            .post('/ongs')
            .send(ong);

        expect(response.body).toHaveProperty('id');
        expect(response.body.id).toHaveLength(8);
        ongId = response.body.id;
    });

    it('should be able to login', async () => {
        const response = await request(app)
            .post('/sessions')
            .send({
                id: ongId
            });
        
        expect(response.body).toHaveProperty('name');
        expect(response.body.name).toBe(ong.name);
    });

    it('should be able to see profile', async() => {
        const response = await request(app)
            .get('/profile')
            .set('Authorization', ongId)
            .send();

        expect(response.status).toBe(200);
    });

    it('should be able to create an incident', async () => {
        const response = await request(app)
            .post('/incidents')
            .set('Authorization', ongId)
            .send(incident);

        expect(response.body).toHaveProperty('id');

        incidentId = response.body.id;
    });

    it('should be able to list the incidents from one ong', async () => {
        const response = await request(app)
            .get('/profile')
            .set('Authorization', ongId)
            .send();
        
        expect(response.body[0].id).toBe(incidentId);
        expect(response.body[0].title).toBe(incident.title);
        expect(response.body[0].description).toBe(incident.description);
        expect(response.body[0].value).toBe(incident.value);
        expect(response.body[0].ong_id).toBe(ongId);
    });

    it('should be able to list all the incidents', async () => {
        const response = await request(app)
            .get('/incidents')
            .set('Authorization', ongId)
            .send();

        expect(response.body[0].id).toBe(incidentId);
        expect(response.body[0].title).toBe(incident.title);
        expect(response.body[0].description).toBe(incident.description);
        expect(response.body[0].value).toBe(incident.value);
        expect(response.body[0].ong_id).toBe(ongId);
        expect(response.body[0].name).toBe(ong.name);
        expect(response.body[0].email).toBe(ong.email);
        expect(response.body[0].whatsapp).toBe(ong.whatsapp);
        expect(response.body[0].city).toBe(ong.city);
        expect(response.body[0].uf).toBe(ong.uf);
    });

    it('should be able to delete an incident', async () => {
        const response = await request(app)
            .delete(`/incidents/${incidentId}`)
            .set('Authorization', ongId)
            .send();

        expect(response.status).toBe(204);
    })
});