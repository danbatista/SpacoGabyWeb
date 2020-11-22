import React from 'react';
import ReactDOM from 'react-dom';
import { Form, Input } from '@rocketseat/unform';
import * as Yup from 'yup';
import { store } from '~/store';
import api from '~/services/api';
import { Content, Wrapper } from './styles';

const schema = Yup.object().shape({
  name: Yup.string().required('O nome é obrigatório'),
  description: Yup.string(),
  recomendations: Yup.string(),
  value: Yup.number('Precisa ser um número'),
});

export default function Service() {
  const { user } = store.getState();
  const provider_id = user.profile.id;

  function renderRedirect() {
    ReactDOM.render('/services');
  }

  function handleSubmit({ name, description, recomendations, value }) {
    const data = {
      name,
      description,
      recomendations,
      value,
      provider_id,
    };
    api.post('services', data).then(() => {
      renderRedirect();
    });
  }

  return (
    <Wrapper>
      <Content>
        <Form schema={schema} onSubmit={handleSubmit}>
          <Input name="name" type="text" placeholder="Nome do Serviço" />
          <Input name="description" type="text" placeholder="Descrição" />
          <Input
            name="recomendations"
            type="text"
            placeholder="Recomendações"
          />
          <Input name="value" type="number" placeholder="Valor" />

          <button type="submit">Criar Serviço</button>
        </Form>
      </Content>
    </Wrapper>
  );
}
