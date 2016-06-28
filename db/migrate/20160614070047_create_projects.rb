class CreateProjects < ActiveRecord::Migration
  def change
    create_table :projects do |t|
      t.string :name
      t.text :description
      t.float :price
      t.datetime :due_date
      t.boolean :is_active
      t.references :user, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
