import { html, on, View } from 'rune-ts';
import { CheckView } from '../7-2_3_4/lib/CheckView';
import { ListView } from '../7-2_3_4/lib/ListView';
import { ToggleListController } from '../7-2_3_4/lib/ToggleListController';
import { AlertView, ConfirmView } from './alert';

type User = {
  id: number;
  name: string;
}

type Chat = {
  users: User[]
};

class UserItemView extends View<User> {
  override template() {
    return html`
      <div>${this.data.name}</div>
    `;
  }
}

class UserListView extends ListView<UserItemView> {
  ItemView = UserItemView;
}

class CheckUserItemView extends View<User> {
  checkView = new CheckView();

  override template() {
    return html`
      <div>
        ${this.checkView}
        ${new UserItemView(this.data)}
      </div>
    `;
  }
}

class CheckUserListView extends ListView<CheckUserItemView> {
  ItemView = CheckUserItemView;
}

class UserPickerView extends View<User[]> {
  private resolve!: (users: User[]) => void;
  readonly promise = new Promise<User[]>(res => this.resolve = res);

  private toggleListController = new ToggleListController(
    new CheckView(),
    new CheckUserListView(this.data),
    (itemView) => itemView.checkView.data.on,
    (itemView, bool) => itemView.checkView.setOn(bool)
  );

  override template() {
    return html`
      <div>
        <div class="header">
          ${this.toggleListController.toggleAllView}
          <h2>친구 선택하기</h2>
          <button class="done">확인</button>
        </div>
        <div class="body">
          ${this.toggleListController.listView}
        </div>
      </div>
    `;
  }

  @on('click', 'button.done')
  private done() {
    this.element().remove();
    this.resolve(
      this.toggleListController
        .listView
        .itemViews
        .filter(({checkView}) => checkView.data.on)
        .map(({data}) => data)
    );
  }

  static open() {
    const users: User[] = [
      {id: 1, name: 'Luka'},
      {id: 2, name: 'Stephen'},
      {id: 3, name: 'Nikola'},
      {id: 4, name: 'Kevin'},
    ];
    const view = new UserPickerView(users);
    document.body.append(view.render());
    return view.promise;
  }
}

class ChatCreationView extends View<Chat> {
  private userListView = new UserListView(this.data.users);

  override template() {
    return html`
      <div>
        <button class="pick">대화상대 선택</button>
        ${this.userListView}
        <button class="create">채팅 시작하기</button>
      </div>
    `;
  }

  @on('click', 'button.pick')
  private async pickUsers() {
    const users = await UserPickerView.open();
    this.userListView.set(users);
  }

  @on('click', 'button.create')
  private async create() {
    if (this.isEmpty()) {
      await AlertView.open('친구들을 선택해주세요.');
    } else {
      if (await ConfirmView.open(this.startMessage)) {
        alert('즐거운 채팅 시작!');
        // new ChatView(this.data)...
      } else {
        this.userListView.set([]);
      }
    }
  }

  isEmpty() {
    return this.data.users.length === 0;
  }

  get startMessage() {
    const names = this.data.users.map(({name}) => name);
    return `${names.join(', ')} 친구들과의 채팅을 시작하겠습니까?`;
  }
}

export function main() {
  document.body.append(
    new ChatCreationView({users: []}).render()
  );
}